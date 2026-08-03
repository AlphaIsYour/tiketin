// packages/core/src/ticket-code.ts
import { randomBytes } from 'crypto';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateOrderCode(): string {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = randomBytes(3).toString('hex').toUpperCase();
    return `TKT-${stamp}-${rand}`;
}

export function generateTicketCode(): string {
    let out = '';
    const bytes = randomBytes(10);
    for (let i = 0; i < 10; i++) {
        out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    return `${out.slice(0, 5)}-${out.slice(5)}`;
}