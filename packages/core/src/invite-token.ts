// packages/core/src/invite-token.ts
import { randomBytes } from 'crypto';

export function generateInviteToken(): string {
    return randomBytes(20).toString('hex');
}