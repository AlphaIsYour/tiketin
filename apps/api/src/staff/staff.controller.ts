// apps/api/src/staff/staff.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Controller('organizers/:organizerId/staff')
@UseGuards(JwtAuthGuard, OrganizerRoleGuard)
export class StaffController {
    constructor(private staffService: StaffService) { }

    @Get()
    @OrganizerRoles('MANAGER')
    listMembers(@Param('organizerId') organizerId: string) {
        return this.staffService.listMembers(organizerId);
    }

    @Get('invites')
    @OrganizerRoles('MANAGER')
    listInvites(@Param('organizerId') organizerId: string) {
        return this.staffService.listPendingInvites(organizerId);
    }

    @Post('invites')
    @OrganizerRoles('OWNER')
    invite(
        @Param('organizerId') organizerId: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: InviteStaffDto,
    ) {
        return this.staffService.inviteStaff(organizerId, user.sub, dto);
    }

    @Delete('invites/:inviteId')
    @OrganizerRoles('OWNER')
    revokeInvite(@Param('organizerId') organizerId: string, @Param('inviteId') inviteId: string) {
        return this.staffService.revokeInvite(organizerId, inviteId);
    }

    @Patch(':memberId')
    @OrganizerRoles('OWNER')
    updateRole(
        @Param('organizerId') organizerId: string,
        @Param('memberId') memberId: string,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.staffService.updateMemberRole(organizerId, memberId, dto);
    }

    @Delete(':memberId')
    @OrganizerRoles('OWNER')
    removeMember(@Param('organizerId') organizerId: string, @Param('memberId') memberId: string) {
        return this.staffService.removeMember(organizerId, memberId);
    }
}