// apps/api/src/ticket-types/ticket-types.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketTypesService } from './ticket-types.service';
import { TicketTypesController } from './ticket-types.controller';

@Module({
    imports: [PrismaModule],
    controllers: [TicketTypesController],
    providers: [TicketTypesService],
})
export class TicketTypesModule { }