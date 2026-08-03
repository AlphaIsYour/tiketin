// apps/web/src/lib/api-client.ts
'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const STORAGE_KEY = 'tiketin_buyer_auth';

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

function readTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function storeTokens(tokens: AuthTokens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
    localStorage.removeItem(STORAGE_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const tokens = readTokens();

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export const apiGet = <T>(path: string) => apiRequest<T>(path, { method: 'GET' });
export const apiPost = <T>(path: string, data?: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });