// apps/organizer/src/app/(dashboard)/events/[eventId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    EventStatusChip,
    Table,
    Td,
    Th,
} from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { EventDetail, TicketType } from '@/lib/organizer-types';
import { TicketTypeFormModal } from '@/components/events/TicketTypeFormModal';

function formatPrice(price: string) {
    const amount = Number(price);
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function EventManagePage() {
    const { eventId } = useParams<{ eventId: string }>();
    const { organizer } = useOrganizer();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTicketType, setEditingTicketType] = useState<TicketType | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    async function loadEvent() {
        if (!organizer) return;
        setIsLoading(true);
        const data = await apiClient.get<EventDetail>(`/organizers/${organizer.organizerId}/events/${eventId}`);
        setEvent(data);
        setIsLoading(false);
    }

    useEffect(() => {
        loadEvent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizer, eventId]);

    async function handlePublish() {
        if (!organizer || !event) return;
        setActionError(null);
        try {
            await apiClient.post(`/organizers/${organizer.organizerId}/events/${event.id}/publish`);
            await loadEvent();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Gagal mempublikasikan event');
        }
    }

    async function handleUnpublish() {
        if (!organizer || !event) return;
        setActionError(null);
        try {
            await apiClient.post(`/organizers/${organizer.organizerId}/events/${event.id}/unpublish`);
            await loadEvent();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Gagal menurunkan event');
        }
    }

    function openCreateTicketType() {
        setEditingTicketType(null);
        setModalOpen(true);
    }

    function openEditTicketType(ticketType: TicketType) {
        setEditingTicketType(ticketType);
        setModalOpen(true);
    }

    if (isLoading || !event) {
        return (
            <>
                <Topbar title="Event" />
                <PageContainer>
                    <p className="text-sm text-[var(--color-gray-600)]">Memuat event...</p>
                </PageContainer>
            </>
        );
    }

    return (
        <>
            <Topbar title={event.title} />
            <PageContainer>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <EventStatusChip status={event.status} />
                        <span className="text-sm text-[var(--color-gray-600)]">
                            {new Date(event.eventStartAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {event.status === 'PUBLISHED' ? (
                            <Button variant="secondary" onClick={handleUnpublish}>
                                Turunkan Event
                            </Button>
                        ) : (
                            <Button onClick={handlePublish} disabled={event.status === 'CANCELLED' || event.status === 'COMPLETED'}>
                                Publikasikan
                            </Button>
                        )}
                    </div>
                </div>

                {actionError && <p className="text-sm text-[var(--color-danger)] mb-4">{actionError}</p>}

                <Card className="mb-6">
                    <CardHeader className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Tipe Tiket</span>
                        <Button size="sm" onClick={openCreateTicketType}>
                            <i className="ri-add-line" />
                            Tambah Tiket
                        </Button>
                    </CardHeader>
                    <CardBody className="p-0">
                        {event.ticketTypes.length === 0 ? (
                            <div className="p-5 text-sm text-[var(--color-gray-600)]">Belum ada tipe tiket. Tambahkan minimal satu sebelum publikasi.</div>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Nama</Th>
                                        <Th>Harga</Th>
                                        <Th>Terjual</Th>
                                        <Th>Kuota</Th>
                                        <Th>Status</Th>
                                        <Th></Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {event.ticketTypes.map((tt) => (
                                        <tr key={tt.id}>
                                            <Td className="font-medium">{tt.name}</Td>
                                            <Td>{formatPrice(tt.price)}</Td>
                                            <Td>{tt.stockSold}</Td>
                                            <Td>{tt.stockTotal}</Td>
                                            <Td>
                                                <Badge tone={tt.isActive ? 'success' : 'neutral'}>{tt.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                                            </Td>
                                            <Td>
                                                <button onClick={() => openEditTicketType(tt)} className="text-primary text-sm font-medium hover:underline">
                                                    Edit
                                                </button>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>

                <TicketTypeFormModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    organizerId={organizer!.organizerId}
                    eventId={event.id}
                    editing={editingTicketType}
                    onSaved={loadEvent}
                />
            </PageContainer>
        </>
    );
}