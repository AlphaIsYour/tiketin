// apps/api/src/payments/providers/midtrans-payment.provider.ts
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as midtransClient from 'midtrans-client';
import {
    NormalizedPaymentStatus,
    PaymentInitiationResult,
    PaymentProvider,
} from '../payment-provider.interface';
import { MidtransNotificationDto } from '../dto/midtrans-notification.dto';

@Injectable()
export class MidtransPaymentProvider implements PaymentProvider {
    private snap: any;
    private serverKey: string;

    constructor() {
        this.serverKey = process.env.MIDTRANS_SERVER_KEY as string;
        this.snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
            serverKey: this.serverKey,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });
    }

    async createTransaction(params: {
        orderId: string;
        orderCode: string;
        amount: number;
        buyerEmail: string;
        buyerName: string;
        finishRedirectUrl?: string;
    }): Promise<PaymentInitiationResult> {
        const transaction = await this.snap.createTransaction({
            transaction_details: {
                order_id: params.orderCode,
                gross_amount: params.amount,
            },
            customer_details: {
                first_name: params.buyerName,
                email: params.buyerEmail,
            },
            ...(params.finishRedirectUrl
                ? { callbacks: { finish: params.finishRedirectUrl } }
                : {}),
        });

        return {
            providerReference: params.orderCode,
            redirectUrl: transaction.redirect_url,
            provider: 'midtrans',
        };
    }

    verifyNotificationSignature(payload: MidtransNotificationDto): boolean {
        if (!this.serverKey) return false;
        const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`;
        const expected = createHash('sha512').update(raw).digest('hex');
        return expected === payload.signature_key;
    }

    resolveStatus(payload: MidtransNotificationDto): NormalizedPaymentStatus {
        const { transaction_status, fraud_status } = payload;

        if (transaction_status === 'capture') {
            if (fraud_status === 'accept') return 'PAID';
            if (fraud_status === 'challenge') return 'PENDING';
            return 'FAILED';
        }
        if (transaction_status === 'settlement') return 'PAID';
        if (transaction_status === 'pending') return 'PENDING';
        if (transaction_status === 'deny') return 'FAILED';
        if (transaction_status === 'cancel') return 'CANCELLED';
        if (transaction_status === 'expire') return 'EXPIRED';
        return 'FAILED';
    }

    extractReference(payload: MidtransNotificationDto): string {
        return payload.order_id;
    }
}