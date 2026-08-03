// apps/organizer/src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { SalesMetricCard, Card, CardHeader, CardBody, EmptyState } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { DashboardSummary } from '@/lib/organizer-orders-types';

interface EventSummary {
    id: string;
    title: string;
    status: string;
    eventStartAt: string;
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function DashboardPage() {
    const { organizer } = useOrganizer();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!organizer) return;
        Promise.all([
            apiClient.get<{ items: EventSummary[] }>(`/organizers/${organizer.organizerId}/events?limit=5`),
            apiClient.get<DashboardSummary>(`/organizers/${organizer.organizerId}/summary`),
        ])
            .then(([eventsRes, summaryRes]) => {
                setEvents(eventsRes.items);
                setSummary(summaryRes);
            })
            .finally(() => setIsLoading(false));
    }, [organizer]);

    return (
        <>
            <Topbar title="Overview" />
            <PageContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <SalesMetricCard label="Tiket Terjual" value={isLoading ? '...' : String(summary?.ticketsSold ?? 0)} icon="ri-ticket-line" />
                    <SalesMetricCard label="Pendapatan" value={isLoading ? '...' : formatPrice(summary?.revenue ?? 0)} icon="ri-money-dollar-circle-line" />
                    <SalesMetricCard label="Event Aktif" value={isLoading ? '...' : String(summary?.activeEvents ?? 0)} icon="ri-calendar-check-line" />
                    <SalesMetricCard label="Sudah Check-in" value={isLoading ? '...' : String(summary?.checkedIn ?? 0)} icon="ri-qr-scan-2-line" />
                </div>

                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--color-gray-900)]">Event Terbaru</span>
                    </CardHeader>
                    <CardBody className="p-0">
                        {isLoading ? (
                            <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                        ) : events.length === 0 ? (
                            <EmptyState icon="ri-calendar-event-line" title="Belum ada event" description="Buat event pertama untuk mulai menjual tiket." />
                        ) : (
                            <ul className="divide-y divide-[var(--color-gray-100)]">
                                {events.map((event) => (
                                    <li key={event.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-gray-900)]">{event.title}</p>
                                            <p className="text-xs text-[var(--color-gray-600)]">{new Date(event.eventStartAt).toLocaleDateString('id-ID')}</p>
                                        </div>
                                        <span className="text-xs font-medium text-[var(--color-gray-600)]">{event.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardBody>
                </Card>
            </PageContainer>
        </>
    );
}