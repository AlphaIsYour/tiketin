// apps/api/src/me/me.controller.ts
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MeService } from './me.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
    constructor(private meService: MeService) { }

    @Get()
    profile(@CurrentUser() user: JwtPayload) {
        return this.meService.getProfile(user.sub);
    }

    @Patch()
    updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
        return this.meService.updateProfile(user.sub, dto);
    }

    @Patch('password')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
        return this.meService.changePassword(user.sub, dto);
    }

    @Get('organizer-memberships')
    organizerMemberships(@CurrentUser() user: JwtPayload) {
        return this.meService.getOrganizerMemberships(user.sub);
    }
}