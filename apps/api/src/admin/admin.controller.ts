// apps/api/src/admin/admin.controller.ts (edit: add organizer detail route)
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { QueryAdminOrganizersDto } from './dto/query-admin-organizers.dto';
import { QueryAdminEventsDto } from './dto/query-admin-events.dto';
import { QueryAdminOrdersDto } from './dto/query-admin-orders.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { UpdateOrganizerStatusDto, UpdateOrganizerVerificationDto } from './dto/update-organizer-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, PlatformRolesGuard)
@PlatformRoles('ADMIN')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('summary')
    summary() {
        return this.adminService.platformSummary();
    }

    @Get('organizers')
    listOrganizers(@Query() query: QueryAdminOrganizersDto) {
        return this.adminService.listOrganizers(query);
    }

    @Get('organizers/:organizerId')
    getOrganizerDetail(@Param('organizerId') organizerId: string) {
        return this.adminService.getOrganizerDetail(organizerId);
    }

    @Patch('organizers/:organizerId/status')
    updateOrganizerStatus(
        @Param('organizerId') organizerId: string,
        @Body() dto: UpdateOrganizerStatusDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.adminService.updateOrganizerStatus(organizerId, dto, user.sub);
    }

    @Patch('organizers/:organizerId/verification')
    updateOrganizerVerification(
        @Param('organizerId') organizerId: string,
        @Body() dto: UpdateOrganizerVerificationDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.adminService.updateOrganizerVerification(organizerId, dto, user.sub);
    }

    @Get('events')
    listEvents(@Query() query: QueryAdminEventsDto) {
        return this.adminService.listEvents(query);
    }

    @Post('events/:eventId/cancel')
    cancelEvent(@Param('eventId') eventId: string, @CurrentUser() user: JwtPayload) {
        return this.adminService.cancelEvent(eventId, user.sub);
    }

    @Get('orders')
    listOrders(@Query() query: QueryAdminOrdersDto) {
        return this.adminService.listOrders(query);
    }

    @Get('audit-logs')
    listAuditLogs(@Query() query: QueryAuditLogsDto) {
        return this.adminService.listAuditLogs(query);
    }
}