// apps/api/src/ticket-types/ticket-types.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
    constructor(private prisma: PrismaService) { }

    private async getEventOwnedByOrganizer(organizerId: string, eventId: string) {
        const event = await this.prisma.event.findFirst({
            where: { id: eventId, organizerId, deletedAt: null },
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    async list(organizerId: string, eventId: string) {
        await this.getEventOwnedByOrganizer(organizerId, eventId);
        return this.prisma.ticketType.findMany({
            where: { eventId },
            orderBy: { sortOrder: 'asc' },
        });
    }

    async create(organizerId: string, eventId: string, dto: CreateTicketTypeDto) {
        const event = await this.getEventOwnedByOrganizer(organizerId, eventId);
        if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
            throw new ForbiddenException('Event is no longer editable');
        }

        const count = await this.prisma.ticketType.count({ where: { eventId } });

        return this.prisma.ticketType.create({
            data: {
                eventId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                stockTotal: dto.stockTotal,
                purchaseLimitPerUser: dto.purchaseLimitPerUser,
                saleStartAt: dto.saleStartAt ? new Date(dto.saleStartAt) : null,
                saleEndAt: dto.saleEndAt ? new Date(dto.saleEndAt) : null,
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? count,
            },
        });
    }

    async update(organizerId: string, eventId: string, ticketTypeId: string, dto: UpdateTicketTypeDto) {
        await this.getEventOwnedByOrganizer(organizerId, eventId);

        const ticketType = await this.prisma.ticketType.findFirst({ where: { id: ticketTypeId, eventId } });
        if (!ticketType) throw new NotFoundException('Ticket type not found');

        if (dto.stockTotal !== undefined && dto.stockTotal < ticketType.stockSold) {
            throw new BadRequestException('stockTotal cannot be lower than tickets already sold');
        }

        return this.prisma.ticketType.update({
            where: { id: ticketTypeId },
            data: {
                name: dto.name ?? ticketType.name,
                description: dto.description ?? ticketType.description,
                price: dto.price ?? ticketType.price,
                stockTotal: dto.stockTotal ?? ticketType.stockTotal,
                purchaseLimitPerUser: dto.purchaseLimitPerUser ?? ticketType.purchaseLimitPerUser,
                saleStartAt: dto.saleStartAt ? new Date(dto.saleStartAt) : ticketType.saleStartAt,
                saleEndAt: dto.saleEndAt ? new Date(dto.saleEndAt) : ticketType.saleEndAt,
                isActive: dto.isActive ?? ticketType.isActive,
                sortOrder: dto.sortOrder ?? ticketType.sortOrder,
            },
        });
    }

    async remove(organizerId: string, eventId: string, ticketTypeId: string) {
        await this.getEventOwnedByOrganizer(organizerId, eventId);

        const ticketType = await this.prisma.ticketType.findFirst({ where: { id: ticketTypeId, eventId } });
        if (!ticketType) throw new NotFoundException('Ticket type not found');
        if (ticketType.stockSold > 0) {
            throw new ForbiddenException('Cannot delete a ticket type with existing sales, deactivate it instead');
        }

        await this.prisma.ticketType.delete({ where: { id: ticketTypeId } });
        return { success: true };
    }
}