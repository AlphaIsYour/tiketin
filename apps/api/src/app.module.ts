// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { CheckinModule } from './checkin/checkin.module';
import { MeModule } from './me/me.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        EventsModule,
        TicketTypesModule,
        OrdersModule,
        PaymentsModule,
        TicketsModule,
        CheckinModule,
        MeModule,
        NotificationsModule,
        AdminModule,
    ],
})
export class AppModule { }