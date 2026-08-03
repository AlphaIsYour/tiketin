// apps/api/src/tickets/tickets.service.ts (edit: buyerEmail snapshot, buyerUserId nullable)
import { Injectable } from '@nestjs/common';
import { generateTicketCode } from '@tiketin/core';
import { signQrToken } from '@tiketin/auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async issueForOrder(orderId: string) {
        const existing = await this.prisma.ticket.findFirst({ where: { orderId } });
        if (existing) return;

        const order = await this.prisma.order.findUniqueOrThrow({
            where: { id: orderId },
            include: { items: true },
        });

        await this.prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                for (let i = 0; i < item.quantity; i++) {
                    const ticket = await tx.ticket.create({
                        data: {
                            orderId: order.id,
                            orderItemId: item.id,
                            eventId: order.eventId,
                            ticketTypeId: item.ticketTypeId,
                            buyerUserId: order.buyerUserId,
                            buyerEmail: order.buyerEmail,
                            ticketCode: generateTicketCode(),
                            qrToken: 'pending',
                            status: 'ISSUED',
                        },
                    });
                    await tx.ticket.update({
                        where: { id: ticket.id },
                        data: { qrToken: signQrToken(ticket.id) },
                    });
                }
            }
        });
    }

    async listForBuyer(buyerUserId: string) {
        return this.prisma.ticket.findMany({
            where: { buyerUserId },
            include: { event: { select: { title: true, slug: true, eventStartAt: true } }, ticketType: true },
            orderBy: { issuedAt: 'desc' },
        });
    }
}