// apps/api/src/organizer-orders/organizer-orders.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizerOrdersService } from './organizer-orders.service';
import { OrganizerOrdersController } from './organizer-orders.controller';

@Module({
    imports: [PrismaModule],
    controllers: [OrganizerOrdersController],
    providers: [OrganizerOrdersService],
})
export class OrganizerOrdersModule { }