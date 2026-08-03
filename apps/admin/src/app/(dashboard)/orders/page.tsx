// apps/admin/src/app/(dashboard)/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { OrderStatusChip, Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api-client';

interface OrderRow {
    id: string;
    orderCode: string;
    buyerEmail: string;
    totalAmount: string;
    status: string;
    createdAt: string;
    event: { title: string };
    payments: { provider: string; status: string }[];
}

function formatPrice(amount: string) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get<{ items: OrderRow[] }>('/admin/orders').then((res) => {
            setOrders(res.items);
            setIsLoading(false);
        });
    }, []);

    return (
        <>
            <Topbar title="Orders" />
            <PageContainer>
                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Kode Order</Th>
                                    <Th>Event</Th>
                                    <Th>Buyer</Th>
                                    <Th>Total</Th>
                                    <Th>Status</Th>
                                    <Th>Tanggal</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o.id}>
                                        <Td className="font-mono text-xs">{o.orderCode}</Td>
                                        <Td>{o.event.title}</Td>
                                        <Td>{o.buyerEmail}</Td>
                                        <Td>{formatPrice(o.totalAmount)}</Td>
                                        <Td><OrderStatusChip status={o.status} /></Td>
                                        <Td>{new Date(o.createdAt).toLocaleDateString('id-ID')}</Td>
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