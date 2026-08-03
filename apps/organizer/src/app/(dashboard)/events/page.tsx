// apps/organizer/src/app/(dashboard)/events/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Table, Th, Td, EventStatusChip, EmptyState } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';

interface EventRow {
    id: string;
    title: string;
    status: string;
    eventStartAt: string;
    city: string | null;
}

export default function EventsPage() {
    const { organizer } = useOrganizer();
    const [events, setEvents] = useState<EventRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!organizer) return;
        apiClient
            .get<{ items: EventRow[] }>(`/organizers/${organizer.organizerId}/events`)
            .then((res) => setEvents(res.items))
            .finally(() => setIsLoading(false));
    }, [organizer]);

    return (
        <>
            <Topbar title="Events" />
            <PageContainer>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[var(--color-gray-600)]">Manage your events and ticket sales.</p>
                    <Link href="/events/new">
                        <Button>
                            <i className="ri-add-line" />
                            Create event
                        </Button>
                    </Link>
                </div>

                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Loading...</div>
                    ) : events.length === 0 ? (
                        <EmptyState
                            icon="ri-calendar-event-line"
                            title="No events yet"
                            description="Create your first event to start selling tickets."
                            action={
                                <Link href="/events/new">
                                    <Button size="sm">Create event</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Event</Th>
                                    <Th>City</Th>
                                    <Th>Date</Th>
                                    <Th>Status</Th>
                                    <Th></Th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <Td className="font-medium">{event.title}</Td>
                                        <Td>{event.city ?? '-'}</Td>
                                        <Td>{new Date(event.eventStartAt).toLocaleDateString('id-ID')}</Td>
                                        <Td><EventStatusChip status={event.status} /></Td>
                                        <Td>
                                            <Link href={`/events/${event.id}`} className="text-primary text-sm font-medium hover:underline">
                                                Manage
                                            </Link>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </PageContainer>
        </>
    );
}