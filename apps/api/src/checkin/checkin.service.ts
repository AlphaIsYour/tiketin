// apps/api/src/checkin/checkin.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { verifyQrToken } from '@tiketin/auth';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckinService {
    constructor(private prisma: PrismaService) { }

    private async recordResult(
        ticketId: string | null,
        eventId: string,
        scannedByUserId: string,
        result: 'SUCCESS' | 'ALREADY_USED' | 'INVALID' | 'REJECTED',
        notes?: string,
    ) {
        if (!ticketId) {
            return this.prisma.checkInLog.create({
                data: { ticketId: 'unknown', eventId, scannedByUserId, result, notes },
            });
        }
        return this.prisma.checkInLog.create({
            data: { ticketId, eventId, scannedByUserId, result, notes },
        });
    }

    async checkInByQr(organizerId: string, eventId: string, scannedByUserId: string, qrToken: string) {
        const payload = verifyQrToken(qrToken);
        if (!payload) {
            throw new NotFoundException('Invalid QR code');
        }

        return this.processCheckIn(organizerId, eventId, scannedByUserId, payload.ticketId);
    }

    async checkInByCode(organizerId: string, eventId: string, scannedByUserId: string, ticketCode: string) {
        const ticket = await this.prisma.ticket.findUnique({ where: { ticketCode } });
        if (!ticket) {
            throw new NotFoundException('Ticket code not found');
        }
        return this.processCheckIn(organizerId, eventId, scannedByUserId, ticket.id);
    }

    private async processCheckIn(
        organizerId: string,
        eventId: string,
        scannedByUserId: string,
        ticketId: string,
    ) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });

        if (!ticket || ticket.eventId !== eventId) {
            await this.recordResult(null, eventId, scannedByUserId, 'INVALID', 'Ticket not found for event');
            throw new NotFoundException('Ticket not valid for this event');
        }

        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event || event.organizerId !== organizerId) {
            throw new ForbiddenException('Event does not belong to organizer');
        }

        if (ticket.status === 'USED') {
            await this.recordResult(ticket.id, eventId, scannedByUserId, 'ALREADY_USED');
            return { status: 'ALREADY_USED', usedAt: ticket.usedAt };
        }

        if (ticket.status !== 'ISSUED') {
            await this.recordResult(ticket.id, eventId, scannedByUserId, 'REJECTED', `status=${ticket.status}`);
            return { status: 'REJECTED', ticketStatus: ticket.status };
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.ticket.updateMany({
                where: { id: ticket.id, status: 'ISSUED' },
                data: { status: 'USED', usedAt: new Date() },
            });

            if (updated.count === 0) {
                await tx.checkInLog.create({
                    data: { ticketId: ticket.id, eventId, scannedByUserId, result: 'ALREADY_USED' },
                });
                return { status: 'ALREADY_USED' as const };
            }

            await tx.checkInLog.create({
                data: { ticketId: ticket.id, eventId, scannedByUserId, result: 'SUCCESS' },
            });

            return { status: 'SUCCESS' as const };
        });

        return result;
    }

    async attendanceSummary(organizerId: string, eventId: string) {
        const event = await this.prisma.event.findFirst({ where: { id: eventId, organizerId } });
        if (!event) throw new NotFoundException('Event not found');

        const [totalTickets, usedTickets] = await this.prisma.$transaction([
            this.prisma.ticket.count({ where: { eventId, status: { in: ['ISSUED', 'USED'] } } }),
            this.prisma.ticket.count({ where: { eventId, status: 'USED' } }),
        ]);

        return { totalTickets, usedTickets, remaining: totalTickets - usedTickets };
    }
}