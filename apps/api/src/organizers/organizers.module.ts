// apps/api/src/organizers/organizers.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';

@Module({
    imports: [PrismaModule],
    controllers: [OrganizersController],
    providers: [OrganizersService],
    exports: [OrganizersService],
})
export class OrganizersModule { }