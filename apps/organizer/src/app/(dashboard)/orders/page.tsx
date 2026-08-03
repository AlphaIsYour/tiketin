// apps/organizer/src/app/(dashboard)/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { EmptyState, OrderStatusChip, Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { OrganizerOrderRow } from '@/lib/organizer-orders-types';

function formatPrice(amount: string) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
}

const STATUS_OPTIONS = ['', 'PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED', 'REFUNDED_PARTIAL', 'REFUNDED_FULL'];

export default function OrdersPage() {
    const { organizer } = useOrganizer();
    const [orders, setOrders] = useState<OrganizerOrderRow[]>([]);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!organizer) return;
        setIsLoading(true);
        const query = status ? `?status=${status}` : '';
        apiClient
            .get<{ items: OrganizerOrderRow[] }>(`/organizers/${organizer.organizerId}/orders${query}`)
            .then((res) => setOrders(res.items))
            .finally(() => setIsLoading(false));
    }, [organizer, status]);

    return (
        <>
            <Topbar title="Orders" />
            <PageContainer>
                <div className="mb-4">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm"
                    >
                        <option value="">Semua Status</option>
                        {STATUS_OPTIONS.slice(1).map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : orders.length === 0 ? (
                        <EmptyState icon="ri-shopping-bag-line" title="Belum ada pesanan" description="Pesanan akan muncul di sini setelah buyer mulai membeli tiket." />
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Kode Order</Th>
                                    <Th>Event</Th>
                                    <Th>Buyer</Th>
                                    <Th>Item</Th>
                                    <Th>Total</Th>
                                    <Th>Status</Th>
                                    <Th>Tanggal</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <Td className="font-mono text-xs">{order.orderCode}</Td>
                                        <Td>{order.event.title}</Td>
                                        <Td>
                                            {order.buyerFullName}
                                            <div className="text-xs text-[var(--color-gray-600)]">{order.buyerEmail}</div>
                                        </Td>
                                        <Td className="text-xs">{order.items.map((i) => `${i.ticketTypeNameSnapshot} x${i.quantity}`).join(', ')}</Td>
                                        <Td>{formatPrice(order.totalAmount)}</Td>
                                        <Td><OrderStatusChip status={order.status} /></Td>
                                        <Td className="text-xs">{new Date(order.createdAt).toLocaleDateString('id-ID')}</Td>
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