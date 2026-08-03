// apps/api/src/organizer-orders/organizer-orders.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOrganizerOrdersDto } from './dto/query-organizer-orders.dto';
import { QueryAttendeesDto } from './dto/query-attendees.dto';

@Injectable()
export class OrganizerOrdersService {
    constructor(private prisma: PrismaService) { }

    async listOrders(organizerId: string, query: QueryOrganizerOrdersDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const where: Prisma.OrderWhereInput = {
            organizerId,
            ...(query.eventId ? { eventId: query.eventId } : {}),
            ...(query.status ? { status: query.status as any } : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    event: { select: { title: true } },
                    items: { select: { ticketTypeNameSnapshot: true, quantity: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async listAttendees(organizerId: string, query: QueryAttendeesDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 30;

        const where: Prisma.TicketWhereInput = {
            event: { organizerId },
            ...(query.eventId ? { eventId: query.eventId } : {}),
            ...(query.status ? { status: query.status as any } : { status: { in: ['ISSUED', 'USED'] } }),
            ...(query.search
                ? {
                    OR: [
                        { buyerEmail: { contains: query.search, mode: 'insensitive' } },
                        { ticketCode: { contains: query.search, mode: 'insensitive' } },
                        { order: { buyerFullName: { contains: query.search, mode: 'insensitive' } } },
                    ],
                }
                : {}),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.ticket.findMany({
                where,
                orderBy: { issuedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    event: { select: { title: true } },
                    ticketType: { select: { name: true } },
                    order: { select: { buyerFullName: true, orderCode: true } },
                },
            }),
            this.prisma.ticket.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async summary(organizerId: string) {
        const [ticketsSold, checkedIn, activeEvents, paidOrders] = await this.prisma.$transaction([
            this.prisma.ticket.count({ where: { event: { organizerId }, status: { in: ['ISSUED', 'USED'] } } }),
            this.prisma.ticket.count({ where: { event: { organizerId }, status: 'USED' } }),
            this.prisma.event.count({ where: { organizerId, status: 'PUBLISHED', deletedAt: null } }),
            this.prisma.order.findMany({ where: { organizerId, status: 'PAID' }, select: { totalAmount: true } }),
        ]);

        const revenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

        return { ticketsSold, checkedIn, activeEvents, revenue };
    }
}