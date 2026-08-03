// apps/api/src/organizers/organizers.controller.ts
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrganizersService } from './organizers.service';
import { CreateOrganizerDto } from './dto/create-organizer.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';

@Controller('organizers')
export class OrganizersController {
    constructor(private organizersService: OrganizersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrganizerDto) {
        return this.organizersService.create(user.sub, dto);
    }

    @Get(':organizerId')
    @UseGuards(JwtAuthGuard, OrganizerRoleGuard)
    @OrganizerRoles('STAFF')
    get(@Param('organizerId') organizerId: string) {
        return this.organizersService.getById(organizerId);
    }

    @Patch(':organizerId')
    @UseGuards(JwtAuthGuard, OrganizerRoleGuard)
    @OrganizerRoles('MANAGER')
    update(@Param('organizerId') organizerId: string, @Body() dto: UpdateOrganizerDto) {
        return this.organizersService.update(organizerId, dto);
    }
}