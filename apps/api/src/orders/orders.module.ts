// apps/api/src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
    imports: [PrismaModule, PaymentsModule, NotificationsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }