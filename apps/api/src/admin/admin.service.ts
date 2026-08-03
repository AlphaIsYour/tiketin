// apps/api/src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAdminOrganizersDto } from './dto/query-admin-organizers.dto';
import { QueryAdminEventsDto } from './dto/query-admin-events.dto';
import { QueryAdminOrdersDto } from './dto/query-admin-orders.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { UpdateOrganizerStatusDto, UpdateOrganizerVerificationDto } from './dto/update-organizer-status.dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async platformSummary() {
        const [organizerCount, eventCount, publishedEventCount, paidOrderCount, ticketCount] =
            await this.prisma.$transaction([
                this.prisma.organizer.count({ where: { deletedAt: null } }),
                this.prisma.event.count({ where: { deletedAt: null } }),
                this.prisma.event.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
                this.prisma.order.count({ where: { status: 'PAID' } }),
                this.prisma.ticket.count({ where: { status: { in: ['ISSUED', 'USED'] } } }),
            ]);

        return { organizerCount, eventCount, publishedEventCount, paidOrderCount, ticketCount };
    }

    async listOrganizers(query: QueryAdminOrganizersDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: Prisma.OrganizerWhereInput = {
            deletedAt: null,
            ...(query.status ? { status: query.status as any } : {}),
            ...(query.verificationStatus ? { verificationStatus: query.verificationStatus as any } : {}),
            ...(query.search
                ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { slug: { contains: query.search, mode: 'insensitive' } }] }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.organizer.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { _count: { select: { events: true } } },
            }),
            this.prisma.organizer.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async updateOrganizerStatus(organizerId: string, dto: UpdateOrganizerStatusDto, actorUserId: string) {
        const organizer = await this.prisma.organizer.findUnique({ where: { id: organizerId } });
        if (!organizer) throw new NotFoundException('Organizer not found');

        const [updated] = await this.prisma.$transaction([
            this.prisma.organizer.update({ where: { id: organizerId }, data: { status: dto.status } }),
            this.prisma.auditLog.create({
                data: {
                    actorUserId,
                    actorRoleContext: 'ADMIN',
                    entityType: 'Organizer',
                    entityId: organizerId,
                    action: 'UPDATE_STATUS',
                    beforeData: { status: organizer.status },
                    afterData: { status: dto.status },
                },
            }),
        ]);

        return updated;
    }

    async updateOrganizerVerification(organizerId: string, dto: UpdateOrganizerVerificationDto, actorUserId: string) {
        const organizer = await this.prisma.organizer.findUnique({ where: { id: organizerId } });
        if (!organizer) throw new NotFoundException('Organizer not found');

        const [updated] = await this.prisma.$transaction([
            this.prisma.organizer.update({ where: { id: organizerId }, data: { verificationStatus: dto.verificationStatus } }),
            this.prisma.auditLog.create({
                data: {
                    actorUserId,
                    actorRoleContext: 'ADMIN',
                    entityType: 'Organizer',
                    entityId: organizerId,
                    action: 'UPDATE_VERIFICATION',
                    beforeData: { verificationStatus: organizer.verificationStatus },
                    afterData: { verificationStatus: dto.verificationStatus },
                },
            }),
        ]);

        return updated;
    }

    async listEvents(query: QueryAdminEventsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: Prisma.EventWhereInput = {
            deletedAt: null,
            ...(query.status ? { status: query.status as any } : {}),
            ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.event.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { organizer: { select: { id: true, name: true, slug: true } } },
            }),
            this.prisma.event.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async cancelEvent(eventId: string, actorUserId: string) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) throw new NotFoundException('Event not found');

        const [updated] = await this.prisma.$transaction([
            this.prisma.event.update({ where: { id: eventId }, data: { status: 'CANCELLED' } }),
            this.prisma.auditLog.create({
                data: {
                    actorUserId,
                    actorRoleContext: 'ADMIN',
                    entityType: 'Event',
                    entityId: eventId,
                    action: 'ADMIN_CANCEL',
                    beforeData: { status: event.status },
                    afterData: { status: 'CANCELLED' },
                },
            }),
        ]);

        return updated;
    }

    async listOrders(query: QueryAdminOrdersDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: Prisma.OrderWhereInput = {
            ...(query.status ? { status: query.status as any } : {}),
            ...(query.search
                ? {
                    OR: [
                        { orderCode: { contains: query.search, mode: 'insensitive' } },
                        { buyerEmail: { contains: query.search, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    event: { select: { title: true } },
                    payments: { select: { provider: true, status: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async listAuditLogs(query: QueryAuditLogsDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 30;

        const where: Prisma.AuditLogWhereInput = {
            ...(query.entityType ? { entityType: query.entityType } : {}),
            ...(query.entityId ? { entityId: query.entityId } : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { actor: { select: { fullName: true, email: true } } },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { items, total, page, limit };
    }
}