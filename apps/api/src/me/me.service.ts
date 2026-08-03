// apps/api/src/me/me.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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