// apps/admin/src/lib/api-client.ts
'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
const STORAGE_KEY = 'tiketin_admin_auth';

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

class ApiClient {
    private accessToken: string | null = null;
    private onUnauthorized: (() => void) | null = null;

    setAccessToken(token: string | null) {
        this.accessToken = token;
    }

    setUnauthorizedHandler(handler: () => void) {
        this.onUnauthorized = handler;
    }

    async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
                ...options.headers,
            },
        });

        if (res.status === 401 || res.status === 403) {
            this.onUnauthorized?.();
            throw new Error('Not authorized');
        }

        if (!res.ok) {
            const body = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message);
        }

        if (res.status === 204) return undefined as T;
        return res.json();
    }

    get<T>(path: string) {
        return this.request<T>(path, { method: 'GET' });
    }
    post<T>(path: string, data?: unknown) {
        return this.request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
    }
    patch<T>(path: string, data?: unknown) {
        return this.request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
    }
}

export const apiClient = new ApiClient();
export { STORAGE_KEY };
export type { AuthTokens };