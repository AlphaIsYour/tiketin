// apps/api/src/events/events.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';
import { randomSlugSuffix, slugify } from '@tiketin/core';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto, QueryOrganizerEventsDto } from './dto/query-events.dto';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    private assertDateRange(startAt: string | Date, endAt: string | Date) {
        if (new Date(endAt) <= new Date(startAt)) {
            throw new BadRequestException('eventEndAt must be after eventStartAt');
        }
    }

    private async generateUniqueSlug(title: string): Promise<string> {
        const base = slugify(title);
        let slug = base;
        for (let attempt = 0; attempt < 5; attempt++) {
            const existing = await this.prisma.event.findUnique({ where: { slug } });
            if (!existing) return slug;
            slug = `${base}-${randomSlugSuffix()}`;
        }
        return `${base}-${randomSlugSuffix(8)}`;
    }

    async create(organizerId: string, userId: string, dto: CreateEventDto) {
        this.assertDateRange(dto.eventStartAt, dto.eventEndAt);
        const slug = await this.generateUniqueSlug(dto.title);

        return this.prisma.event.create({
            data: {
                organizerId,
                categoryId: dto.categoryId,
                title: dto.title,
                slug,
                shortDescription: dto.shortDescription,
                fullDescription: dto.fullDescription,
                bannerUrl: dto.bannerUrl,
                venueName: dto.venueName,
                venueAddress: dto.venueAddress,
                city: dto.city,
                isOnline: dto.isOnline ?? false,
                onlineUrl: dto.onlineUrl,
                eventStartAt: new Date(dto.eventStartAt),
                eventEndAt: new Date(dto.eventEndAt),
                salesStartAt: dto.salesStartAt ? new Date(dto.salesStartAt) : null,
                salesEndAt: dto.salesEndAt ? new Date(dto.salesEndAt) : null,
                timezone: dto.timezone ?? 'Asia/Jakarta',
                capacityMode: dto.capacityMode ?? 'UNLIMITED',
                capacityTotal: dto.capacityTotal,
                visibility: dto.visibility ?? 'PUBLIC',
                status: 'DRAFT',
                createdByUserId: userId,
            },
        });
    }

    async listByOrganizer(organizerId: string, query: QueryOrganizerEventsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: Prisma.EventWhereInput = {
            organizerId,
            deletedAt: null,
            ...(query.status ? { status: query.status as EventStatus } : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.event.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { category: true },
            }),
            this.prisma.event.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async getForOrganizer(organizerId: string, eventId: string) {
        const event = await this.prisma.event.findFirst({
            where: { id: eventId, organizerId, deletedAt: null },
            include: { category: true, ticketTypes: { orderBy: { sortOrder: 'asc' } } },
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async update(organizerId: string, eventId: string, dto: UpdateEventDto) {
        const event = await this.getForOrganizer(organizerId, eventId);

        if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
            throw new ForbiddenException('Event is no longer editable');
        }

        const startAt = dto.eventStartAt ?? event.eventStartAt.toISOString();
        const endAt = dto.eventEndAt ?? event.eventEndAt.toISOString();
        this.assertDateRange(startAt, endAt);

        return this.prisma.event.update({
            where: { id: eventId },
            data: {
                categoryId: dto.categoryId ?? event.categoryId,
                title: dto.title ?? event.title,
                shortDescription: dto.shortDescription ?? event.shortDescription,
                fullDescription: dto.fullDescription ?? event.fullDescription,
                bannerUrl: dto.bannerUrl ?? event.bannerUrl,
                venueName: dto.venueName ?? event.venueName,
                venueAddress: dto.venueAddress ?? event.venueAddress,
                city: dto.city ?? event.city,
                isOnline: dto.isOnline ?? event.isOnline,
                onlineUrl: dto.onlineUrl ?? event.onlineUrl,
                eventStartAt: new Date(startAt),
                eventEndAt: new Date(endAt),
                salesStartAt: dto.salesStartAt ? new Date(dto.salesStartAt) : event.salesStartAt,
                salesEndAt: dto.salesEndAt ? new Date(dto.salesEndAt) : event.salesEndAt,
                timezone: dto.timezone ?? event.timezone,
                capacityMode: dto.capacityMode ?? event.capacityMode,
                capacityTotal: dto.capacityTotal ?? event.capacityTotal,
                visibility: dto.visibility ?? event.visibility,
            },
        });
    }

    async publish(organizerId: string, eventId: string, userId: string) {
        const event = await this.getForOrganizer(organizerId, eventId);
        if (event.status === 'PUBLISHED') return event;
        if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
            throw new ForbiddenException('Event cannot be published from current status');
        }

        const [updated] = await this.prisma.$transaction([
            this.prisma.event.update({
                where: { id: eventId },
                data: { status: 'PUBLISHED', publishedAt: new Date() },
            }),
            this.prisma.auditLog.create({
                data: {
                    actorUserId: userId,
                    entityType: 'Event',
                    entityId: eventId,
                    action: 'PUBLISH',
                    beforeData: { status: event.status },
                    afterData: { status: 'PUBLISHED' },
                },
            }),
        ]);

        return updated;
    }

    async unpublish(organizerId: string, eventId: string, userId: string) {
        const event = await this.getForOrganizer(organizerId, eventId);
        if (event.status !== 'PUBLISHED') {
            throw new ForbiddenException('Only published events can be unpublished');
        }

        const [updated] = await this.prisma.$transaction([
            this.prisma.event.update({
                where: { id: eventId },
                data: { status: 'UNPUBLISHED' },
            }),
            this.prisma.auditLog.create({
                data: {
                    actorUserId: userId,
                    entityType: 'Event',
                    entityId: eventId,
                    action: 'UNPUBLISH',
                    beforeData: { status: event.status },
                    afterData: { status: 'UNPUBLISHED' },
                },
            }),
        ]);

        return updated;
    }

    async cancel(organizerId: string, eventId: string, userId: string) {
        const event = await this.getForOrganizer(organizerId, eventId);
        if (event.status === 'CANCELLED') return event;

        const [updated] = await this.prisma.$transaction([
            this.prisma.event.update({
                where: { id: eventId },
                data: { status: 'CANCELLED' },
            }),
            this.prisma.auditLog.create({
                data: {
                    actorUserId: userId,
                    entityType: 'Event',
                    entityId: eventId,
                    action: 'CANCEL',
                    beforeData: { status: event.status },
                    afterData: { status: 'CANCELLED' },
                },
            }),
        ]);

        return updated;
    }

    async listPublic(query: QueryEventsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: Prisma.EventWhereInput = {
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            deletedAt: null,
            ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
            ...(query.category ? { category: { slug: query.category } } : {}),
            ...(query.search
                ? {
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { shortDescription: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.event.findMany({
                where,
                orderBy: { eventStartAt: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    category: true,
                    organizer: { select: { id: true, name: true, slug: true, logoUrl: true } },
                },
            }),
            this.prisma.event.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async getPublicBySlug(slug: string) {
        const event = await this.prisma.event.findFirst({
            where: { slug, status: 'PUBLISHED', visibility: 'PUBLIC', deletedAt: null },
            include: {
                category: true,
                organizer: { select: { id: true, name: true, slug: true, logoUrl: true, bannerUrl: true } },
                ticketTypes: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }
}