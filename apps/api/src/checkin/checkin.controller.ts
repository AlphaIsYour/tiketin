// apps/api/src/checkin/checkin.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CheckinService } from './checkin.service';
import { CheckInDto, ManualCheckInDto } from './dto/checkin.dto';

@Controller('organizers/:organizerId/events/:eventId/checkin')
@UseGuards(JwtAuthGuard, OrganizerRoleGuard)
export class CheckinController {
    constructor(private checkinService: CheckinService) { }

    @Post('scan')
    @OrganizerRoles('SCANNER')
    @Throttle({ default: { limit: 60, ttl: 60_000 } })
    scan(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: CheckInDto,
    ) {
        return this.checkinService.checkInByQr(organizerId, eventId, user.sub, dto.qrToken);
    }

    @Post('manual')
    @OrganizerRoles('SCANNER')
    @Throttle({ default: { limit: 60, ttl: 60_000 } })
    manual(
        @Param('organizerId') organizerId: string,
        @Param('eventId') eventId: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: ManualCheckInDto,
    ) {
        return this.checkinService.checkInByCode(organizerId, eventId, user.sub, dto.ticketCode);
    }

    @Get('summary')
    @OrganizerRoles('STAFF')
    summary(@Param('organizerId') organizerId: string, @Param('eventId') eventId: string) {
        return this.checkinService.attendanceSummary(organizerId, eventId);
    }
}