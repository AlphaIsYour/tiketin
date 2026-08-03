// apps/organizer/src/app/(dashboard)/checkin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EventStatusChip, EmptyState } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { CheckinEventOption } from '@/lib/checkin-types';

export default function CheckinEventSelectPage() {
    const { organizer } = useOrganizer();
    const [events, setEvents] = useState<CheckinEventOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!organizer) return;
        apiClient
            .get<{ items: CheckinEventOption[] }>(`/organizers/${organizer.organizerId}/events?status=PUBLISHED`)
            .then((res) => setEvents(res.items))
            .finally(() => setIsLoading(false));
    }, [organizer]);

    return (
        <>
            <Topbar title="Check-in" />
            <PageContainer>
                <p className="text-sm text-[var(--color-gray-600)] mb-4">Pilih event untuk membuka scanner check-in.</p>

                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : events.length === 0 ? (
                        <EmptyState
                            icon="ri-qr-scan-line"
                            title="Belum ada event yang dipublikasikan"
                            description="Publikasikan event terlebih dahulu untuk mulai melakukan check-in."
                        />
                    ) : (
                        <ul className="divide-y divide-[var(--color-gray-100)]">
                            {events.map((event) => (
                                <li key={event.id}>
                                    <Link
                                        href={`/checkin/${event.id}`}
                                        className="flex items-center justify-between px-5 py-3 hover:bg-[var(--color-gray-50)]"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-gray-900)]">{event.title}</p>
                                            <p className="text-xs text-[var(--color-gray-600)]">
                                                {new Date(event.eventStartAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <EventStatusChip status={event.status} />
                                            <i className="ri-arrow-right-s-line text-[var(--color-gray-400)]" />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PageContainer>
        </>
    );
}