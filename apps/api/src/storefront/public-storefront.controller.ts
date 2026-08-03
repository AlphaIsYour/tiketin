// apps/api/src/storefront/public-storefront.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { StorefrontService } from './storefront.service';

@Controller('storefronts')
export class PublicStorefrontController {
    constructor(private storefrontService: StorefrontService) { }

    @Get(':slug')
    getBySlug(@Param('slug') slug: string) {
        return this.storefrontService.getPublicBySlug(slug);
    }
}