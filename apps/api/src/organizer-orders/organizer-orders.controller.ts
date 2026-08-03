// apps/api/src/organizer-orders/organizer-orders.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { OrganizerOrdersService } from './organizer-orders.service';
import { QueryOrganizerOrdersDto } from './dto/query-organizer-orders.dto';
import { QueryAttendeesDto } from './dto/query-attendees.dto';

@Controller('organizers/:organizerId')
@UseGuards(JwtAuthGuard, OrganizerRoleGuard)
export class OrganizerOrdersController {
    constructor(private organizerOrdersService: OrganizerOrdersService) { }

    @Get('orders')
    @OrganizerRoles('STAFF')
    listOrders(@Param('organizerId') organizerId: string, @Query() query: QueryOrganizerOrdersDto) {
        return this.organizerOrdersService.listOrders(organizerId, query);
    }

    @Get('attendees')
    @OrganizerRoles('STAFF')
    listAttendees(@Param('organizerId') organizerId: string, @Query() query: QueryAttendeesDto) {
        return this.organizerOrdersService.listAttendees(organizerId, query);
    }

    @Get('summary')
    @OrganizerRoles('STAFF')
    summary(@Param('organizerId') organizerId: string) {
        return this.organizerOrdersService.summary(organizerId);
    }
}