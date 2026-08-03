// apps/api/src/ticket-types/ticket-types.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Controller('organizers/:organizerId/events/:eventId/ticket-types')
@UseGuards(JwtAuthGuard, OrganizerRoleGuard)
export class TicketTypesController {
    constructor(private ticketTypesService: TicketTypesService) { }

    @Get()
    @OrganizerRoles('STAFF')
    list(@Param('organizerId') organizerId: string, @Param('eventId') eventId: string) {
        return this.ticketTypesService.list(organizerId, eventId);
    }

    @Post()
    @OrganizerRoles('MANAGER')
    create(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @Body() dto: CreateTicketTypeDto,
    ) {
        return this.ticketTypesService.create(organizerId, eventId, dto);
    }

    @Patch(':ticketTypeId')
    @OrganizerRoles('MANAGER')
    update(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @Param('ticketTypeId') ticketTypeId: string,
        @Body() dto: UpdateTicketTypeDto,
    ) {
        return this.ticketTypesService.update(organizerId, eventId, ticketTypeId, dto);
    }

    @Delete(':ticketTypeId')
    @OrganizerRoles('MANAGER')
    remove(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @Param('ticketTypeId') ticketTypeId: string,
    ) {
        return this.ticketTypesService.remove(organizerId, eventId, ticketTypeId);
    }
}