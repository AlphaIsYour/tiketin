// apps/web/src/lib/guest-orders.ts
'use client';

const PREFIX = 'tiketin_guest_order_';

export function storeGuestOrderToken(orderId: string, token: string) {
    localStorage.setItem(`${PREFIX}${orderId}`, token);
}

export function getGuestOrderToken(orderId: string): string | null {
    return localStorage.getItem(`${PREFIX}${orderId}`);
}