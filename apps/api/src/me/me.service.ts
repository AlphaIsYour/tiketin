// apps/api/src/me/me.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { comparePassword, hashPassword } from '@tiketin/auth';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class MeService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        return this.prisma.user.findUniqueOrThrow({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                phoneNumber: true,
                avatarUrl: true,
                status: true,
                platformRole: true,
            },
        });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: dto.fullName ?? user.fullName,
                phoneNumber: dto.phoneNumber ?? user.phoneNumber,
                avatarUrl: dto.avatarUrl ?? user.avatarUrl,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phoneNumber: true,
                avatarUrl: true,
                status: true,
                platformRole: true,
            },
        });
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        if (!user.passwordHash) {
            throw new BadRequestException('This account has no password set');
        }

        const isValid = await comparePassword(dto.currentPassword, user.passwordHash);
        if (!isValid) throw new UnauthorizedException('Current password is incorrect');

        const newPasswordHash = await hashPassword(dto.newPassword);

        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newPasswordHash } }),
            this.prisma.session.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);

        return { success: true };
    }

    async getOrganizerMemberships(userId: string) {
        const memberships = await this.prisma.organizerMember.findMany({
            where: { userId, status: 'ACTIVE' },
            include: {
                organizer: { select: { id: true, name: true, slug: true, logoUrl: true, status: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        return memberships.map((m) => ({
            organizerId: m.organizerId,
            role: m.role,
            organizer: m.organizer,
        }));
    }
}