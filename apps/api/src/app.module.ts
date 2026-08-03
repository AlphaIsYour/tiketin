// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { CheckinModule } from './checkin/checkin.module';
import { MeModule } from './me/me.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        EventsModule,
        OrdersModule,
        PaymentsModule,
        TicketsModule,
        CheckinModule,
        MeModule,
    ],
})
export class AppModule { }