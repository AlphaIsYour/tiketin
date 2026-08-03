// apps/organizer/src/app/(dashboard)/attendees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Badge, EmptyState, Input, Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { AttendeeRow } from '@/lib/organizer-orders-types';

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'danger'> = {
    ISSUED: 'neutral',
    USED: 'success',
    CANCELLED: 'danger',
    REFUNDED: 'danger',
    INVALIDATED: 'danger',
};

export default function AttendeesPage() {
    const { organizer } = useOrganizer();
    const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    async function load() {
        if (!organizer) return;
        setIsLoading(true);
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await apiClient.get<{ items: AttendeeRow[] }>(`/organizers/${organizer.organizerId}/attendees${query}`);
        setAttendees(res.items);
        setIsLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizer]);

    return (
        <>
            <Topbar title="Attendees" />
            <PageContainer>
                <div className="mb-4">
                    <Input
                        placeholder="Cari nama, email, atau kode tiket"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && load()}
                        className="max-w-xs"
                    />
                </div>

                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : attendees.length === 0 ? (
                        <EmptyState icon="ri-team-line" title="Belum ada attendee" description="Attendee akan muncul di sini setelah tiket terbit." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Nama</Th>
                                    <Th>Event</Th>
                                    <Th>Tipe Tiket</Th>
                                    <Th>Kode Tiket</Th>
                                    <Th>Status</Th>
                                    <Th>Check-in</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendees.map((a) => (
                                    <tr key={a.id}>
                                        <Td>
                                            {a.order.buyerFullName}
                                            <div className="text-xs text-[var(--color-gray-600)]">{a.buyerEmail}</div>
                                        </Td>
                                        <Td>{a.event.title}</Td>
                                        <Td>{a.ticketType.name}</Td>
                                        <Td className="font-mono text-xs">{a.ticketCode}</Td>
                                        <Td><Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge></Td>
                                        <Td className="text-xs">{a.usedAt ? new Date(a.usedAt).toLocaleString('id-ID') : '-'}</Td>
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