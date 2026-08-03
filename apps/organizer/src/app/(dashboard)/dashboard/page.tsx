// apps/organizer/src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { SalesMetricCard, Card, CardHeader, CardBody, EmptyState } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';

interface EventSummary {
    id: string;
    title: string;
    status: string;
    eventStartAt: string;
}

export default function DashboardPage() {
    const { organizer, isLoading: isOrganizerLoading } = useOrganizer();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    useEffect(() => {
        if (!organizer) return;
        apiClient
            .get<{ items: EventSummary[] }>(`/organizers/${organizer.organizerId}/events?limit=5`)
            .then((res) => setEvents(res.items))
            .finally(() => setIsLoadingEvents(false));
    }, [organizer]);

    return (
        <>
            <Topbar title="Overview" />
            <PageContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <SalesMetricCard label="Tickets sold" value="0" icon="ri-ticket-line" />
                    <SalesMetricCard label="Revenue" value="Rp 0" icon="ri-money-dollar-circle-line" />
                    <SalesMetricCard label="Active events" value={String(events.filter((e) => e.status === 'PUBLISHED').length)} icon="ri-calendar-check-line" />
                    <SalesMetricCard label="Checked in" value="0" icon="ri-qr-scan-2-line" />
                </div>

                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--color-gray-900)]">Recent events</span>
                    </CardHeader>
                    <CardBody className="p-0">
                        {isOrganizerLoading || isLoadingEvents ? (
                            <div className="p-5 text-sm text-[var(--color-gray-600)]">Loading...</div>
                        ) : events.length === 0 ? (
                            <EmptyState
                                icon="ri-calendar-event-line"
                                title="No events yet"
                                description="Create your first event to start selling tickets."
                            />
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