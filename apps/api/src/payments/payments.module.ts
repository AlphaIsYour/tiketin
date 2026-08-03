// apps/api/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TicketsModule } from '../tickets/tickets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MidtransPaymentProvider } from './providers/midtrans-payment.provider';
import { PAYMENT_PROVIDER } from './payment-provider.token';

@Module({
    imports: [PrismaModule, TicketsModule, NotificationsModule],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        MidtransPaymentProvider,
        { provide: PAYMENT_PROVIDER, useExisting: MidtransPaymentProvider },
    ],
    exports: [PaymentsService],
})
export class PaymentsModule { }