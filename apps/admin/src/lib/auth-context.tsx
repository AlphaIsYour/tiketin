// apps/admin/src/lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, STORAGE_KEY, AuthTokens } from './api-client';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const tokens: AuthTokens = JSON.parse(raw);
            apiClient.setAccessToken(tokens.accessToken);
            setIsAuthenticated(true);
        }
        apiClient.setUnauthorizedHandler(() => {
            localStorage.removeItem(STORAGE_KEY);
            setIsAuthenticated(false);
            router.push('/login');
        });
        setIsLoading(false);
    }, [router]);

    async function login(email: string, password: string) {
        const tokens = await apiClient.post<AuthTokens>('/auth/login', { email, password });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
        apiClient.setAccessToken(tokens.accessToken);
        setIsAuthenticated(true);
        router.push('/organizers');
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        apiClient.setAccessToken(null);
        setIsAuthenticated(false);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}