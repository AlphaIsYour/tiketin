// packages/core/src/guest-token.ts
import { randomBytes } from 'crypto';

export function generateGuestAccessToken(): string {
    return randomBytes(24).toString('hex');
}