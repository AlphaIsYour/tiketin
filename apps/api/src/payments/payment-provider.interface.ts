// apps/api/src/payments/payment-provider.interface.ts
export interface PaymentInitiationResult {
    providerReference: string;
    redirectUrl: string;
    provider: string;
}

export type NormalizedPaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export interface PaymentProvider {
    createTransaction(params: {
        orderId: string;
        orderCode: string;
        amount: number;
        buyerEmail: string;
        buyerName: string;
        finishRedirectUrl?: string;
    }): Promise<PaymentInitiationResult>;

    verifyNotificationSignature(payload: Record<string, any>): boolean;
    resolveStatus(payload: Record<string, any>): NormalizedPaymentStatus;
    extractReference(payload: Record<string, any>): string;
}