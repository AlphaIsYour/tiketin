// apps/api/src/payments/providers/stub-payment.provider.ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
    NormalizedPaymentStatus,
    PaymentInitiationResult,
    PaymentProvider,
} from '../payment-provider.interface';

@Injectable()
export class StubPaymentProvider implements PaymentProvider {
    async createTransaction(params: {
        orderId: string;
        orderCode: string;
        amount: number;
        buyerEmail: string;
        buyerName: string;
    }): Promise<PaymentInitiationResult> {
        const reference = `STUB-${params.orderCode || params.orderId}-${randomUUID().slice(0, 8)}`;
        return {
            providerReference: reference,
            redirectUrl: `${process.env.APP_WEB_URL || 'http://localhost:3000'}/checkout/mock-pay?ref=${reference}`,
            provider: 'stub',
        };
    }

    verifyNotificationSignature(_payload: Record<string, any>): boolean {
        return true;
    }

    resolveStatus(payload: Record<string, any>): NormalizedPaymentStatus {
        if (payload?.status === 'FAILED') return 'FAILED';
        if (payload?.status === 'EXPIRED') return 'EXPIRED';
        if (payload?.status === 'CANCELLED') return 'CANCELLED';
        if (payload?.status === 'PENDING') return 'PENDING';
        return 'PAID';
    }

    extractReference(payload: Record<string, any>): string {
        return payload?.providerReference || payload?.orderId || 'STUB-REF';
    }
}