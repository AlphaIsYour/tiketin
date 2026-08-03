// apps/api/src/orders/orders.service.spec.ts
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
    let prisma: any;
    let paymentsService: any;
    let notificationsService: any;
    let service: OrdersService;

    const publishedEvent = {
        id: 'event-1',
        organizerId: 'org-1',
        status: 'PUBLISHED',
        deletedAt: null,
        salesStartAt: null,
        salesEndAt: null,
    };

    const ticketType = {
        id: 'tt-1',
        eventId: 'event-1',
        name: 'Regular',
        price: 50000,
        stockTotal: 10,
        stockSold: 9,
        purchaseLimitPerUser: 5,
        saleStartAt: null,
        saleEndAt: null,
        isActive: true,
    };

    beforeEach(() => {
        prisma = {
            event: { findFirst: jest.fn() },
            ticketType: { findMany: jest.fn(), update: jest.fn() },
            order: { create: jest.fn(), findMany: jest.fn() },
            orderItem: { findMany: jest.fn() },
            $transaction: jest.fn(),
        };
        paymentsService = { initiate: jest.fn().mockResolvedValue({ redirectUrl: 'https://pay.example', id: 'pay-1' }) };
        notificationsService = { sendOrderCreatedEmail: jest.fn().mockResolvedValue(undefined) };
        service = new OrdersService(prisma, paymentsService, notificationsService);
    });

    it('rejects checkout when the conditional stock update finds no matching row (sold out)', async () => {
        prisma.event.findFirst.mockResolvedValue(publishedEvent);
        prisma.ticketType.findMany.mockResolvedValue([ticketType]);
        prisma.$transaction.mockImplementation(async (fn: any) =>
            fn({
                ticketType: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
                order: { create: jest.fn() },
            }),
        );

        await expect(
            service.create(
                { eventId: 'event-1', items: [{ ticketTypeId: 'tt-1', quantity: 2 }], buyerFullName: 'Budi', buyerEmail: 'budi@example.com' },
                undefined,
            ),
        ).rejects.toThrow(ConflictException);

        expect(paymentsService.initiate).not.toHaveBeenCalled();
    });

    it('reserves stock atomically and creates the order when quantity is available', async () => {
        prisma.event.findFirst.mockResolvedValue(publishedEvent);
        prisma.ticketType.findMany.mockResolvedValue([{ ...ticketType, stockSold: 3 }]);
        const createdOrder = { id: 'order-1', orderCode: 'TKT-ABC', totalAmount: 51500, items: [] };
        prisma.$transaction.mockImplementation(async (fn: any) =>
            fn({
                ticketType: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
                order: { create: jest.fn().mockResolvedValue(createdOrder) },
            }),
        );

        const result = await service.create(
            { eventId: 'event-1', items: [{ ticketTypeId: 'tt-1', quantity: 1 }], buyerFullName: 'Budi', buyerEmail: 'budi@example.com' },
            undefined,
        );

        expect(result.order).toEqual(createdOrder);
        expect(paymentsService.initiate).toHaveBeenCalledTimes(1);
        expect(notificationsService.sendOrderCreatedEmail).toHaveBeenCalledWith('order-1');
    });

    it('rejects checkout for an event that is not published', async () => {
        prisma.event.findFirst.mockResolvedValue(null);

        await expect(
            service.create({ eventId: 'event-1', items: [], buyerFullName: 'Budi', buyerEmail: 'b@x.com' }, undefined),
        ).rejects.toThrow(NotFoundException);
    });

    it('rejects checkout before the sales window opens', async () => {
        prisma.event.findFirst.mockResolvedValue({ ...publishedEvent, salesStartAt: new Date('2099-01-01') });

        await expect(
            service.create({ eventId: 'event-1', items: [], buyerFullName: 'Budi', buyerEmail: 'b@x.com' }, undefined),
        ).rejects.toThrow(BadRequestException);
    });

    describe('expireStaleOrders (checkout expiry cron)', () => {
        it('expires stale PENDING orders and releases their reserved stock', async () => {
            prisma.order.findMany.mockResolvedValue([{ id: 'order-9' }]);
            prisma.$transaction.mockImplementation(async (fn: any) =>
                fn({
                    order: { update: jest.fn().mockResolvedValue({}) },
                    payment: { updateMany: jest.fn().mockResolvedValue({}) },
                }),
            );
            prisma.orderItem.findMany.mockResolvedValue([{ ticketTypeId: 'tt-1', quantity: 2 }]);
            prisma.ticketType.update.mockResolvedValue({});

            await service.expireStaleOrders();

            expect(prisma.orderItem.findMany).toHaveBeenCalledWith({ where: { orderId: 'order-9' } });
            expect(prisma.ticketType.update).toHaveBeenCalledWith({
                where: { id: 'tt-1' },
                data: { stockSold: { decrement: 2 } },
            });
        });

        it('does nothing when there are no stale orders', async () => {
            prisma.order.findMany.mockResolvedValue([]);

            await service.expireStaleOrders();

            expect(prisma.$transaction).not.toHaveBeenCalled();
            expect(prisma.ticketType.update).not.toHaveBeenCalled();
        });
    });
});