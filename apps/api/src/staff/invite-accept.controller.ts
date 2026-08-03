// apps/api/src/staff/invite-accept.controller.ts
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StaffService } from './staff.service';

@Controller('staff-invites')
export class InviteAcceptController {
    constructor(private staffService: StaffService) { }

    @Get(':token')
    preview(@Param('token') token: string) {
        return this.staffService.previewInvite(token);
    }

    @Post(':token/accept')
    @UseGuards(JwtAuthGuard)
    accept(@Param('token') token: string, @CurrentUser() user: JwtPayload) {
        return this.staffService.acceptInvite(token, user.sub, user.email);
    }
}