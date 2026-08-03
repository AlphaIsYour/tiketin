// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizersModule } from './organizers/organizers.module';
import { EventsModule } from './events/events.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { OrdersModule } from './orders/orders.module';
import { OrganizerOrdersModule } from './organizer-orders/organizer-orders.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { CheckinModule } from './checkin/checkin.module';
import { MeModule } from './me/me.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { StaffModule } from './staff/staff.module';
import { StorefrontModule } from './storefront/storefront.module';
import { createThrottlerStorage } from './throttler/throttler-storage.factory';

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
            storage: createThrottlerStorage(),
        }),
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        OrganizersModule,
        EventsModule,
        TicketTypesModule,
        OrdersModule,
        OrganizerOrdersModule,
        PaymentsModule,
        TicketsModule,
        CheckinModule,
        MeModule,
        NotificationsModule,
        AdminModule,
        StaffModule,
        StorefrontModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }