// apps/api/src/auth/auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
    comparePassword,
    hashPassword,
    hashToken,
    PlatformRole,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from '@tiketin/auth';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email already registered');

        const passwordHash = await hashPassword(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                status: 'ACTIVE',
            },
        });

        return this.issueTokens(user.id, user.email, user.platformRole as PlatformRole);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

        const valid = await comparePassword(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');
        if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account not active');

        return this.issueTokens(user.id, user.email, user.platformRole as PlatformRole);
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) throw new UnauthorizedException('Refresh token required');

        const payload = verifyRefreshToken(refreshToken);
        const session = await this.prisma.session.findFirst({
            where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });

        if (!session || session.refreshTokenHash !== hashToken(refreshToken)) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.prisma.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });

        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
        return this.issueTokens(user.id, user.email, user.platformRole as PlatformRole);
    }

    async logout(userId: string) {
        await this.prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }

    private async issueTokens(userId: string, email: string, platformRole: PlatformRole) {
        const accessToken = signAccessToken({ sub: userId, email, platformRole });
        const refreshToken = signRefreshToken({ sub: userId, email, platformRole });

        await this.prisma.session.create({
            data: {
                id: randomUUID(),
                userId,
                refreshTokenHash: hashToken(refreshToken),
                expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
            },
        });

        return { accessToken, refreshToken };
    }
}