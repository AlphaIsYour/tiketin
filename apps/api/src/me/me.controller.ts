// apps/api/src/me/me.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MeService } from './me.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
    constructor(private meService: MeService) { }

    @Get()
    profile(@CurrentUser() user: JwtPayload) {
        return this.meService.getProfile(user.sub);
    }

    @Get('organizer-memberships')
    organizerMemberships(@CurrentUser() user: JwtPayload) {
        return this.meService.getOrganizerMemberships(user.sub);
    }
}