// apps/admin/src/app/(dashboard)/events/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { EventStatusChip, Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api-client';

interface EventRow {
    id: string;
    title: string;
    status: string;
    eventStartAt: string;
    organizer: { name: string; slug: string };
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    async function load() {
        setIsLoading(true);
        const res = await apiClient.get<{ items: EventRow[] }>('/admin/events');
        setEvents(res.items);
        setIsLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCancel(id: string) {
        setBusyId(id);
        await apiClient.post(`/admin/events/${id}/cancel`);
        await load();
        setBusyId(null);
    }

    return (
        <>
            <Topbar title="Events" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Event</Th>
                                    <Th>Organizer</Th>
                                    <Th>Tanggal</Th>
                                    <Th>Status</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((e) => (
                                    <tr key={e.id}>
                                        <Td className="font-medium">{e.title}</Td>
                                        <Td>{e.organizer.name}</Td>
                                        <Td>{new Date(e.eventStartAt).toLocaleDateString('id-ID')}</Td>
                                        <Td><EventStatusChip status={e.status} /></Td>
                                        <Td>
                                            {e.status !== 'CANCELLED' && (
                                                <button
                                                    disabled={busyId === e.id}
                                                    onClick={() => handleCancel(e.id)}
                                                    className="text-[var(--color-danger)] text-xs hover:underline disabled:opacity-50"
                                                >
                                                    Batalkan
                                                </button>
                                            )}
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