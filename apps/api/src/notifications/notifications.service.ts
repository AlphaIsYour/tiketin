// apps/api/src/notifications/notifications.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProvider } from './email-provider.interface';
import { EMAIL_PROVIDER } from './email-provider.token';
import { orderCreatedTemplate } from './templates/order-created.template';
import { paymentConfirmedTemplate } from './templates/payment-confirmed.template';

const WEB_URL = process.env.APP_WEB_URL as string;

function formatCurrency(amount: string, currency: string) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(amount));
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService, @Inject(EMAIL_PROVIDER) private emailProvider: EmailProvider) { }

    async sendOrderCreatedEmail(orderId: string) {
        try {
            const order = await this.prisma.order.findUniqueOrThrow({
                where: { id: orderId },
                include: { event: { select: { title: true } } },
            });
            if (!order.guestAccessToken) return;

            const orderUrl = `${WEB_URL}/orders/${order.id}?token=${order.guestAccessToken}`;
            const { subject, html } = orderCreatedTemplate({
                buyerFullName: order.buyerFullName,
                eventTitle: order.event.title,
                orderCode: order.orderCode,
                totalAmount: formatCurrency(order.totalAmount.toString(), order.currency),
                orderUrl,
            });

            await this.emailProvider.send({ to: order.buyerEmail, subject, html });
        } catch (err) {
            this.logger.error(`Failed to send order-created email for order ${orderId}`, err as Error);
        }
    }

    async sendPaymentConfirmedEmail(orderId: string) {
        try {
            const order = await this.prisma.order.findUniqueOrThrow({
                where: { id: orderId },
                include: { event: { select: { title: true } }, tickets: true },
            });

            const orderUrl = order.guestAccessToken
                ? `${WEB_URL}/orders/${order.id}?token=${order.guestAccessToken}`
                : `${WEB_URL}/orders/${order.id}`;

            const { subject, html } = paymentConfirmedTemplate({
                buyerFullName: order.buyerFullName,
                eventTitle: order.event.title,
                orderCode: order.orderCode,
                ticketCount: order.tickets.length,
                orderUrl,
            });

            await this.emailProvider.send({ to: order.buyerEmail, subject, html });
        } catch (err) {
            this.logger.error(`Failed to send payment-confirmed email for order ${orderId}`, err as Error);
        }
    }
}