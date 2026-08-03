// packages/auth/src/qr-token.ts
import { createHmac, randomUUID } from 'crypto';

const QR_SECRET = process.env.TICKET_QR_SECRET as string;

export interface QrPayload {
    ticketId: string;
    nonce: string;
}

function assertSecret() {
    if (!QR_SECRET) throw new Error('TICKET_QR_SECRET must be set');
}

export function signQrToken(ticketId: string): string {
    assertSecret();
    const nonce = randomUUID();
    const payload = `${ticketId}.${nonce}`;
    const signature = createHmac('sha256', QR_SECRET).update(payload).digest('hex');
    return `${payload}.${signature}`;
}

export function verifyQrToken(token: string): QrPayload | null {
    assertSecret();
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [ticketId, nonce, signature] = parts;
    const expected = createHmac('sha256', QR_SECRET).update(`${ticketId}.${nonce}`).digest('hex');
    if (expected !== signature) return null;
    return { ticketId, nonce };
}