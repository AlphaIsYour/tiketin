// apps/organizer/src/lib/organizer-context.tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from './api-client';
import { useAuth } from './auth-context';

interface OrganizerMembership {
    organizerId: string;
    organizer: { id: string; name: string; slug: string };
    role: 'OWNER' | 'MANAGER' | 'STAFF' | 'SCANNER';
}

interface OrganizerContextValue {
    organizer: OrganizerMembership | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

const OrganizerContext = createContext<OrganizerContextValue | null>(null);

export function OrganizerProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [organizer, setOrganizer] = useState<OrganizerMembership | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!isAuthenticated) {
            setOrganizer(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const memberships = await apiClient.get<OrganizerMembership[]>('/me/organizer-memberships');
            setOrganizer(memberships[0] ?? null);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return (
        <OrganizerContext.Provider value={{ organizer, isLoading, refetch }}>{children}</OrganizerContext.Provider>
    );
}

export function useOrganizer() {
    const ctx = useContext(OrganizerContext);
    if (!ctx) throw new Error('useOrganizer must be used within OrganizerProvider');
    return ctx;
}