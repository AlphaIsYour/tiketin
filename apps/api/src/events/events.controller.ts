// apps/api/src/events/events.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryOrganizerEventsDto } from './dto/query-events.dto';

@Controller('organizers/:organizerId/events')
@UseGuards(JwtAuthGuard, OrganizerRoleGuard)
export class EventsController {
    constructor(private eventsService: EventsService) { }

    @Post()
    @OrganizerRoles('MANAGER')
    create(
        @Param('organizerId') organizerId: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateEventDto,
    ) {
        return this.eventsService.create(organizerId, user.sub, dto);
    }

    @Get()
    @OrganizerRoles('STAFF')
    list(@Param('organizerId') organizerId: string, @Query() query: QueryOrganizerEventsDto) {
        return this.eventsService.listByOrganizer(organizerId, query);
    }

    @Get(':eventId')
    @OrganizerRoles('STAFF')
    detail(@Param('organizerId') organizerId: string, @Param('eventId') eventId: string) {
        return this.eventsService.getForOrganizer(organizerId, eventId);
    }

    @Patch(':eventId')
    @OrganizerRoles('MANAGER')
    update(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @Body() dto: UpdateEventDto,
    ) {
        return this.eventsService.update(organizerId, eventId, dto);
    }

    @Post(':eventId/publish')
    @OrganizerRoles('MANAGER')
    publish(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.eventsService.publish(organizerId, eventId, user.sub);
    }

    @Post(':eventId/unpublish')
    @OrganizerRoles('MANAGER')
    unpublish(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.eventsService.unpublish(organizerId, eventId, user.sub);
    }

    @Post(':eventId/cancel')
    @OrganizerRoles('MANAGER')
    cancel(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.eventsService.cancel(organizerId, eventId, user.sub);
    }
}