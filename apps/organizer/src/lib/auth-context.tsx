// apps/organizer/src/lib/auth-context.tsx 
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from './api-client';

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'tiketin_organizer_auth';

function readStoredTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const tokens = readStoredTokens();
        if (tokens) {
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
    }

    async function register(fullName: string, email: string, password: string) {
        const tokens = await apiClient.post<AuthTokens>('/auth/register', { fullName, email, password });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
        apiClient.setAccessToken(tokens.accessToken);
        setIsAuthenticated(true);
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        apiClient.setAccessToken(null);
        setIsAuthenticated(false);
        router.push('/login');
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}