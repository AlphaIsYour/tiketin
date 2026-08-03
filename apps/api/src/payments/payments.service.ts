// apps/api/src/payments/payments.service.ts (edit: initiate signature accepts finishRedirectUrl)
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { PaymentProvider } from './payment-provider.interface';
import { PAYMENT_PROVIDER } from './payment-provider.token';
import { MidtransNotificationDto } from './dto/midtrans-notification.dto';

const TERMINAL_STATUSES = ['PAID', 'FAILED', 'EXPIRED', 'CANCELLED'];

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private ticketsService: TicketsService,
        @Inject(PAYMENT_PROVIDER) private provider: PaymentProvider,
    ) { }

    async initiate(
        orderId: string,
        orderCode: string,
        amount: number,
        buyer: { email: string; fullName: string },
        finishRedirectUrl?: string,
    ) {
        const result = await this.provider.createTransaction({
            orderId,
            orderCode,
            amount,
            buyerEmail: buyer.email,
            buyerName: buyer.fullName,
            finishRedirectUrl,
        });

        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                provider: result.provider,
                providerReference: result.providerReference,
                grossAmount: amount,
                status: 'PENDING',
            },
            select: { id: true, providerReference: true, status: true },
        });

        return { ...payment, redirectUrl: result.redirectUrl };
    }

    async handleWebhook(payload: MidtransNotificationDto) {
        const isValid = this.provider.verifyNotificationSignature(payload);
        if (!isValid) throw new BadRequestException('Invalid signature');

        const reference = this.provider.extractReference(payload);
        const payment = await this.prisma.payment.findUnique({
            where: { providerReference: reference },
            include: { order: { include: { items: true } } },
        });
        if (!payment) throw new NotFoundException('Payment not found');

        if (TERMINAL_STATUSES.includes(payment.status)) {
            return { success: true, alreadyProcessed: true };
        }

        const status = this.provider.resolveStatus(payload);

        if (status === 'PENDING') {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'PENDING', rawPayload: payload as any },
            });
            return { success: true };
        }

        if (status === 'PAID') {
            await this.prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: 'PAID', paidAt: new Date(), rawPayload: payload as any },
                });
                await tx.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'PAID', paidAt: new Date() },
                });
                await tx.auditLog.create({
                    data: {
                        entityType: 'Order',
                        entityId: payment.orderId,
                        action: 'PAYMENT_CONFIRMED',
                        afterData: { providerReference: reference },
                    },
                });
            });

            await this.ticketsService.issueForOrder(payment.orderId);
            return { success: true };
        }

        const orderStatus = status === 'EXPIRED' ? 'EXPIRED' : status === 'CANCELLED' ? 'CANCELLED' : 'FAILED';

        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: { status, rawPayload: payload as any },
            });
            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: orderStatus },
            });
            for (const item of payment.order.items) {
                await tx.ticketType.update({
                    where: { id: item.ticketTypeId },
                    data: { stockSold: { decrement: item.quantity } },
                });
            }
        });

        return { success: true };
    }
}