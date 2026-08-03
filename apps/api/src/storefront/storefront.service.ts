// apps/api/src/storefront/storefront.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';

const DEFAULT_ACCENT_COLOR = '#1e99d5';
const DEFAULT_THEME_PRESET = 'default';
const EVENTS_PREVIEW_LIMIT = 20;

@Injectable()
export class StorefrontService {
    constructor(private prisma: PrismaService) { }

    async getForOrganizer(organizerId: string) {
        const existing = await this.prisma.organizerStorefront.findUnique({ where: { organizerId } });
        if (existing) return existing;

        return this.prisma.organizerStorefront.create({
            data: {
                organizerId,
                accentColor: DEFAULT_ACCENT_COLOR,
                themePreset: DEFAULT_THEME_PRESET,
                isPublic: true,
            },
        });
    }

    async update(organizerId: string, dto: UpdateStorefrontDto) {
        const current = await this.getForOrganizer(organizerId);

        return this.prisma.organizerStorefront.update({
            where: { organizerId },
            data: {
                headline: dto.headline ?? current.headline,
                subheadline: dto.subheadline ?? current.subheadline,
                accentColor: dto.accentColor ?? current.accentColor,
                themePreset: dto.themePreset ?? current.themePreset,
                coverImageUrl: dto.coverImageUrl ?? current.coverImageUrl,
                ctaLabel: dto.ctaLabel ?? current.ctaLabel,
                ctaUrl: dto.ctaUrl ?? current.ctaUrl,
                isPublic: dto.isPublic ?? current.isPublic,
            },
        });
    }

    async getPublicBySlug(slug: string) {
        const organizer = await this.prisma.organizer.findFirst({
            where: { slug, status: 'ACTIVE', deletedAt: null },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logoUrl: true,
                bannerUrl: true,
                instagramUrl: true,
                websiteUrl: true,
                verificationStatus: true,
                storefront: true,
            },
        });

        if (!organizer || (organizer.storefront && !organizer.storefront.isPublic)) {
            throw new NotFoundException('Storefront not found');
        }

        const events = await this.prisma.event.findMany({
            where: { organizerId: organizer.id, status: 'PUBLISHED', visibility: 'PUBLIC', deletedAt: null },
            orderBy: { eventStartAt: 'asc' },
            take: EVENTS_PREVIEW_LIMIT,
            select: {
                id: true,
                title: true,
                slug: true,
                bannerUrl: true,
                city: true,
                eventStartAt: true,
                ticketTypes: { select: { price: true }, orderBy: { price: 'asc' }, take: 1 },
            },
        });

        return {
            organizer: {
                name: organizer.name,
                slug: organizer.slug,
                description: organizer.description,
                logoUrl: organizer.logoUrl,
                bannerUrl: organizer.bannerUrl,
                instagramUrl: organizer.instagramUrl,
                websiteUrl: organizer.websiteUrl,
                isVerified: organizer.verificationStatus === 'VERIFIED',
            },
            storefront: {
                headline: organizer.storefront?.headline ?? null,
                subheadline: organizer.storefront?.subheadline ?? null,
                accentColor: organizer.storefront?.accentColor ?? DEFAULT_ACCENT_COLOR,
                themePreset: organizer.storefront?.themePreset ?? DEFAULT_THEME_PRESET,
                coverImageUrl: organizer.storefront?.coverImageUrl ?? null,
                ctaLabel: organizer.storefront?.ctaLabel ?? null,
                ctaUrl: organizer.storefront?.ctaUrl ?? null,
            },
            events,
        };
    }
}