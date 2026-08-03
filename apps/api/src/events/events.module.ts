// apps/api/src/events/events.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PublicEventsController } from './public-events.controller';

@Module({
    imports: [PrismaModule],
    controllers: [EventsController, PublicEventsController],
    providers: [EventsService],
    exports: [EventsService],
})
export class EventsModule { }