// apps/web/src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EmptyState, OrderStatusChip } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { useAuth } from '@/lib/auth-context';
import { apiGet } from '@/lib/api-client';
import { BuyerOrderListItem } from '@/lib/order-list-types';

function formatPrice(amount: string) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
}

export default function OrderHistoryPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [orders, setOrders] = useState<BuyerOrderListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!isAuthenticated) {
            router.push('/login?redirect=/orders');
            return;
        }
        apiGet<BuyerOrderListItem[]>('/orders')
            .then(setOrders)
            .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat pesanan'))
            .finally(() => setIsLoading(false));
    }, [isAuthLoading, isAuthenticated, router]);

    if (isAuthLoading || (!isAuthenticated && !error)) {
        return (
            <>
                <PublicHeader />
                <div className="p-6 text-sm text-[var(--color-gray-600)]">Memuat...</div>
            </>
        );
    }

    return (
        <>
            <PublicHeader />
            <div className="max-w-lg mx-auto px-4 py-6">
                <h1 className="text-lg font-semibold text-[var(--color-gray-900)] mb-4">Tiket Saya</h1>

                {isLoading ? (
                    <p className="text-sm text-[var(--color-gray-600)]">Memuat pesanan...</p>
                ) : error ? (
                    <p className="text-sm text-[var(--color-danger)]">{error}</p>
                ) : orders.length === 0 ? (
                    <div className="border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                        <EmptyState
                            icon="ri-ticket-2-line"
                            title="Belum ada pesanan"
                            description="Tiket yang kamu beli akan muncul di sini."
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="flex gap-3 border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-3 hover:bg-[var(--color-gray-50)]"
                            >
                                {order.event.bannerUrl && (
                                    <img src={order.event.bannerUrl} alt={order.event.title} className="w-16 h-16 rounded-[var(--radius-sm)] object-cover shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium text-[var(--color-gray-900)] truncate">{order.event.title}</p>
                                        <OrderStatusChip status={order.status} />
                                    </div>
                                    <p className="text-xs text-[var(--color-gray-600)] mt-0.5">
                                        {order.items.map((i) => `${i.ticketTypeNameSnapshot} x${i.quantity}`).join(', ')}
                                    </p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-xs text-[var(--color-gray-600)] font-mono">{order.orderCode}</span>
                                        <span className="text-sm font-semibold text-[var(--color-gray-900)]">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}