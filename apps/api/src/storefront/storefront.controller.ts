// apps/api/src/storefront/storefront.controller.ts
import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizerRoleGuard } from '../auth/guards/organizer-role.guard';
import { OrganizerRoles } from '../auth/decorators/organizer-roles.decorator';
import { StorefrontService } from './storefront.service';
import { UpdateStorefrontDto } from './dto/update-storefront.dto';

@Controller('organizers/:organizerId/storefront')
@UseGuards(JwtAuthGuard, OrganizerRoleGuard)
export class StorefrontController {
    constructor(private storefrontService: StorefrontService) { }

    @Get()
    @OrganizerRoles('STAFF')
    get(@Param('organizerId') organizerId: string) {
        return this.storefrontService.getForOrganizer(organizerId);
    }

    @Patch()
    @OrganizerRoles('MANAGER')
    update(@Param('organizerId') organizerId: string, @Body() dto: UpdateStorefrontDto) {
        return this.storefrontService.update(organizerId, dto);
    }
}