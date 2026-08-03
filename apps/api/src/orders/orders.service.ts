// apps/api/src/orders/orders.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { generateGuestAccessToken, generateOrderCode } from '@tiketin/core';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

const CHECKOUT_TTL_MINUTES = 15;
const PLATFORM_FEE_RATE = 0.03;
const WEB_URL = process.env.APP_WEB_URL as string;

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private paymentsService: PaymentsService,
        private notificationsService: NotificationsService,
    ) { }

    async create(dto: CreateOrderDto, buyerUserId?: string) {
        const event = await this.prisma.event.findFirst({
            where: { id: dto.eventId, status: 'PUBLISHED', deletedAt: null },
        });
        if (!event) throw new NotFoundException('Event not found or not published');

        const now = new Date();
        if (event.salesStartAt && now < event.salesStartAt) {
            throw new BadRequestException('Ticket sales have not started');
        }
        if (event.salesEndAt && now > event.salesEndAt) {
            throw new BadRequestException('Ticket sales have ended');
        }

        const ticketTypeIds = dto.items.map((i) => i.ticketTypeId);
        const ticketTypes = await this.prisma.ticketType.findMany({
            where: { id: { in: ticketTypeIds }, eventId: dto.eventId, isActive: true },
        });

        const guestAccessToken = generateGuestAccessToken();

        const order = await this.prisma.$transaction(async (tx) => {
            let subtotal = 0;
            const orderItemsData: {
                ticketTypeId: string;
                ticketTypeNameSnapshot: string;
                unitPrice: number;
                quantity: number;
                lineTotal: number;
            }[] = [];

            for (const item of dto.items) {
                const ticketType = ticketTypes.find((t) => t.id === item.ticketTypeId);
                if (!ticketType) throw new NotFoundException(`Ticket type ${item.ticketTypeId} not found`);

                if (ticketType.saleStartAt && now < ticketType.saleStartAt) {
                    throw new BadRequestException(`${ticketType.name} sales not started`);
                }
                if (ticketType.saleEndAt && now > ticketType.saleEndAt) {
                    throw new BadRequestException(`${ticketType.name} sales ended`);
                }
                if (ticketType.purchaseLimitPerUser && item.quantity > ticketType.purchaseLimitPerUser) {
                    throw new BadRequestException(`${ticketType.name} exceeds purchase limit`);
                }

                const reserved = await tx.ticketType.updateMany({
                    where: {
                        id: ticketType.id,
                        stockSold: { lte: ticketType.stockTotal - item.quantity },
                    },
                    data: { stockSold: { increment: item.quantity } },
                });

                if (reserved.count === 0) {
                    throw new ConflictException(`${ticketType.name} is sold out or insufficient stock`);
                }

                const unitPrice = Number(ticketType.price);
                const lineTotal = unitPrice * item.quantity;
                subtotal += lineTotal;

                orderItemsData.push({
                    ticketTypeId: ticketType.id,
                    ticketTypeNameSnapshot: ticketType.name,
                    unitPrice,
                    quantity: item.quantity,
                    lineTotal,
                });
            }

            const feeAmount = Math.round(subtotal * PLATFORM_FEE_RATE);
            const totalAmount = subtotal + feeAmount;

            return tx.order.create({
                data: {
                    orderCode: generateOrderCode(),
                    buyerUserId: buyerUserId ?? null,
                    buyerEmail: dto.buyerEmail,
                    buyerFullName: dto.buyerFullName,
                    guestAccessToken,
                    eventId: dto.eventId,
                    organizerId: event.organizerId,
                    subtotalAmount: subtotal,
                    feeAmount,
                    discountAmount: 0,
                    totalAmount,
                    status: 'PENDING',
                    checkoutExpiresAt: new Date(now.getTime() + CHECKOUT_TTL_MINUTES * 60 * 1000),
                    items: { create: orderItemsData },
                },
                include: { items: true },
            });
        });

        const finishRedirectUrl = `${WEB_URL}/orders/${order.id}?token=${guestAccessToken}`;

        const payment = await this.paymentsService.initiate(
            order.id,
            order.orderCode,
            Number(order.totalAmount),
            { email: dto.buyerEmail, fullName: dto.buyerFullName },
            finishRedirectUrl,
        );

        void this.notificationsService.sendOrderCreatedEmail(order.id);

        return { order, payment, guestAccessToken };
    }

    async getOrderForViewer(orderId: string, viewerUserId?: string, guestToken?: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                payments: { select: { id: true, provider: true, status: true, paidAt: true } },
                tickets: { include: { ticketType: { select: { name: true } } } },
            },
        });
        if (!order) throw new NotFoundException('Order not found');

        const ownedByUser = viewerUserId && order.buyerUserId === viewerUserId;
        const ownedByGuestToken = !!guestToken && !!order.guestAccessToken && guestToken === order.guestAccessToken;

        if (!ownedByUser && !ownedByGuestToken) {
            throw new ForbiddenException('Not authorized to view this order');
        }

        const { guestAccessToken, ...safeOrder } = order;
        return { ...safeOrder, canClaim: !order.buyerUserId };
    }

    async listForBuyer(buyerUserId: string) {
        return this.prisma.order.findMany({
            where: { buyerUserId },
            orderBy: { createdAt: 'desc' },
            include: { items: true, event: { select: { title: true, slug: true, bannerUrl: true } } },
        });
    }

    async claimGuestOrder(orderId: string, userId: string, guestToken: string) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');
        if (order.buyerUserId) {
            if (order.buyerUserId === userId) return { success: true, alreadyClaimed: true };
            throw new ForbiddenException('Order already claimed by another account');
        }
        if (!order.guestAccessToken || guestToken !== order.guestAccessToken) {
            throw new ForbiddenException('Invalid claim token');
        }

        await this.prisma.$transaction([
            this.prisma.order.update({
                where: { id: orderId },
                data: { buyerUserId: userId, guestAccessToken: null },
            }),
            this.prisma.ticket.updateMany({
                where: { orderId },
                data: { buyerUserId: userId },
            }),
        ]);

        return { success: true };
    }

    private async releaseStock(orderId: string) {
        const items = await this.prisma.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
            await this.prisma.ticketType.update({
                where: { id: item.ticketTypeId },
                data: { stockSold: { decrement: item.quantity } },
            });
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async expireStaleOrders() {
        const now = new Date();
        const staleOrders = await this.prisma.order.findMany({
            where: { status: 'PENDING', checkoutExpiresAt: { lt: now } },
        });

        for (const order of staleOrders) {
            await this.prisma.$transaction(async (tx) => {
                await tx.order.update({ where: { id: order.id }, data: { status: 'EXPIRED' } });
                await tx.payment.updateMany({
                    where: { orderId: order.id, status: { in: ['INITIATED', 'PENDING'] } },
                    data: { status: 'EXPIRED' },
                });
            });
            await this.releaseStock(order.id);
        }
    }
}