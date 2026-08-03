// apps/api/src/tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
    imports: [PrismaModule],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketsModule { }