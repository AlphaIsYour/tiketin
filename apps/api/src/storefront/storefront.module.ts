// apps/api/src/storefront/storefront.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorefrontService } from './storefront.service';
import { StorefrontController } from './storefront.controller';
import { PublicStorefrontController } from './public-storefront.controller';

@Module({
    imports: [PrismaModule],
    controllers: [StorefrontController, PublicStorefrontController],
    providers: [StorefrontService],
})
export class StorefrontModule { }