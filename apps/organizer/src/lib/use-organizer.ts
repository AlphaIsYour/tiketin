// apps/organizer/src/lib/use-organizer.ts
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from './api-client';

interface OrganizerMembership {
    organizerId: string;
    organizer: { id: string; name: string; slug: string };
    role: string;
}

export function useOrganizer() {
    const [organizer, setOrganizer] = useState<OrganizerMembership | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient
            .get<OrganizerMembership[]>('/me/organizer-memberships')
            .then((memberships) => setOrganizer(memberships[0] ?? null))
            .finally(() => setIsLoading(false));
    }, []);

    return { organizer, isLoading };
}