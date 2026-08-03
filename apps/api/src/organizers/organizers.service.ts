// apps/api/src/organizers/organizers.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomSlugSuffix, slugify } from '@tiketin/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';

@Injectable()
export class OrganizersService {
    constructor(private prisma: PrismaService) { }

    private async generateUniqueSlug(name: string): Promise<string> {
        const base = slugify(name);
        let slug = base;
        for (let attempt = 0; attempt < 5; attempt++) {
            const existing = await this.prisma.organizer.findUnique({ where: { slug } });
            if (!existing) return slug;
            slug = `${base}-${randomSlugSuffix()}`;
        }
        return `${base}-${randomSlugSuffix(8)}`;
    }

    async create(userId: string, dto: CreateOrganizerDto) {
        const slug = await this.generateUniqueSlug(dto.name);

        return this.prisma.$transaction(async (tx) => {
            const organizer = await tx.organizer.create({
                data: {
                    ownerUserId: userId,
                    name: dto.name,
                    slug,
                    description: dto.description,
                    logoUrl: dto.logoUrl,
                    bannerUrl: dto.bannerUrl,
                    emailContact: dto.emailContact,
                    phoneContact: dto.phoneContact,
                    instagramUrl: dto.instagramUrl,
                    websiteUrl: dto.websiteUrl,
                    verificationStatus: 'UNVERIFIED',
                    status: 'ACTIVE',
                },
            });

            await tx.organizerMember.create({
                data: {
                    organizerId: organizer.id,
                    userId,
                    role: 'OWNER',
                    status: 'ACTIVE',
                    invitedByUserId: userId,
                },
            });

            await tx.organizerStorefront.create({
                data: {
                    organizerId: organizer.id,
                    accentColor: '#1e99d5',
                    themePreset: 'default',
                    isPublic: true,
                },
            });

            return organizer;
        });
    }

    async getById(organizerId: string) {
        const organizer = await this.prisma.organizer.findFirst({ where: { id: organizerId, deletedAt: null } });
        if (!organizer) throw new NotFoundException('Organizer not found');
        return organizer;
    }

    async update(organizerId: string, dto: UpdateOrganizerDto) {
        const organizer = await this.getById(organizerId);
        if (organizer.status === 'SUSPENDED') {
            throw new ForbiddenException('Suspended organizer profile cannot be edited');
        }

        return this.prisma.organizer.update({
            where: { id: organizerId },
            data: {
                name: dto.name ?? organizer.name,
                description: dto.description ?? organizer.description,
                logoUrl: dto.logoUrl ?? organizer.logoUrl,
                bannerUrl: dto.bannerUrl ?? organizer.bannerUrl,
                emailContact: dto.emailContact ?? organizer.emailContact,
                phoneContact: dto.phoneContact ?? organizer.phoneContact,
                instagramUrl: dto.instagramUrl ?? organizer.instagramUrl,
                websiteUrl: dto.websiteUrl ?? organizer.websiteUrl,
            },
        });
    }
}