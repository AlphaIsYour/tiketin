// apps/web/src/lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from './api-client';

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
const STORAGE_KEY = 'tiketin_buyer_auth';

function persist(tokens: AuthTokens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        setIsAuthenticated(!!raw);
        setIsLoading(false);
    }, []);

    async function login(email: string, password: string) {
        const tokens = await apiRequest<AuthTokens>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        persist(tokens);
        setIsAuthenticated(true);
    }

    async function register(fullName: string, email: string, password: string) {
        const tokens = await apiRequest<AuthTokens>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password }),
        });
        persist(tokens);
        setIsAuthenticated(true);
    }

    function logout() {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
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