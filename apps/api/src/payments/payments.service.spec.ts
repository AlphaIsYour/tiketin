// apps/api/src/payments/payments.service.spec.ts
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

function createMockTx() {
    return {
        payment: { update: jest.fn().mockResolvedValue({}) },
        order: { update: jest.fn().mockResolvedValue({}) },
        auditLog: { create: jest.fn().mockResolvedValue({}) },
        ticketType: { update: jest.fn().mockResolvedValue({}) },
    };
}

describe('PaymentsService.handleWebhook', () => {
    let prisma: any;
    let ticketsService: any;
    let notificationsService: any;
    let provider: any;
    let service: PaymentsService;

    beforeEach(() => {
        prisma = { payment: { findUnique: jest.fn() }, $transaction: jest.fn() };
        ticketsService = { issueForOrder: jest.fn().mockResolvedValue(undefined) };
        notificationsService = { sendPaymentConfirmedEmail: jest.fn().mockResolvedValue(undefined) };
        provider = {
            verifyNotificationSignature: jest.fn().mockReturnValue(true),
            extractReference: jest.fn().mockReturnValue('ORDER-REF-1'),
            resolveStatus: jest.fn(),
        };
        service = new PaymentsService(prisma, ticketsService, notificationsService, provider);
    });

    it('rejects payloads with an invalid signature before touching the database', async () => {
        provider.verifyNotificationSignature.mockReturnValue(false);

        await expect(service.handleWebhook({} as any)).rejects.toThrow(BadRequestException);
        expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when no payment matches the reference', async () => {
        prisma.payment.findUnique.mockResolvedValue(null);

        await expect(service.handleWebhook({} as any)).rejects.toThrow(NotFoundException);
    });

    it('short-circuits on a terminal status without re-issuing tickets (idempotency)', async () => {
        prisma.payment.findUnique.mockResolvedValue({
            id: 'pay-1',
            orderId: 'order-1',
            status: 'PAID',
            order: { items: [] },
        });

        const result = await service.handleWebhook({} as any);

        expect(result).toEqual({ success: true, alreadyProcessed: true });
        expect(prisma.$transaction).not.toHaveBeenCalled();
        expect(ticketsService.issueForOrder).not.toHaveBeenCalled();
    });

    it('processes a PAID notification: updates order, issues tickets, sends confirmation email', async () => {
        prisma.payment.findUnique.mockResolvedValue({
            id: 'pay-1',
            orderId: 'order-1',
            status: 'PENDING',
            order: { items: [{ ticketTypeId: 'tt-1', quantity: 2 }] },
        });
        provider.resolveStatus.mockReturnValue('PAID');
        prisma.$transaction.mockImplementation(async (fn: any) => fn(createMockTx()));

        const result = await service.handleWebhook({} as any);

        expect(result).toEqual({ success: true });
        expect(ticketsService.issueForOrder).toHaveBeenCalledWith('order-1');
        expect(ticketsService.issueForOrder).toHaveBeenCalledTimes(1);
        expect(notificationsService.sendPaymentConfirmedEmail).toHaveBeenCalledWith('order-1');
    });

    it('a retried webhook for an already-PAID payment does not re-issue tickets', async () => {
        prisma.payment.findUnique.mockResolvedValueOnce({
            id: 'pay-1',
            orderId: 'order-1',
            status: 'PENDING',
            order: { items: [] },
        });
        provider.resolveStatus.mockReturnValue('PAID');
        prisma.$transaction.mockImplementation(async (fn: any) => fn(createMockTx()));

        await service.handleWebhook({} as any);

        prisma.payment.findUnique.mockResolvedValueOnce({
            id: 'pay-1',
            orderId: 'order-1',
            status: 'PAID',
            order: { items: [] },
        });

        const secondResult = await service.handleWebhook({} as any);

        expect(secondResult).toEqual({ success: true, alreadyProcessed: true });
        expect(ticketsService.issueForOrder).toHaveBeenCalledTimes(1);
    });

    it('releases reserved stock when the payment fails', async () => {
        prisma.payment.findUnique.mockResolvedValue({
            id: 'pay-1',
            orderId: 'order-1',
            status: 'PENDING',
            order: { items: [{ ticketTypeId: 'tt-1', quantity: 3 }] },
        });
        provider.resolveStatus.mockReturnValue('FAILED');
        const tx = createMockTx();
        prisma.$transaction.mockImplementation(async (fn: any) => fn(tx));

        await service.handleWebhook({} as any);

        expect(tx.order.update).toHaveBeenCalledWith({ where: { id: 'order-1' }, data: { status: 'FAILED' } });
        expect(tx.ticketType.update).toHaveBeenCalledWith({
            where: { id: 'tt-1' },
            data: { stockSold: { decrement: 3 } },
        });
    });
});