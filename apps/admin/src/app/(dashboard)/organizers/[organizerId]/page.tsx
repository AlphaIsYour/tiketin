// apps/admin/src/app/(dashboard)/organizers/[organizerId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Card, CardBody, CardHeader, EventStatusChip, OrderStatusChip, SalesMetricCard, Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api-client';
import { OrganizerDetail } from '@/lib/organizer-detail-types';

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    ACTIVE: 'success',
    INACTIVE: 'neutral',
    SUSPENDED: 'danger',
};

const VERIFICATION_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    VERIFIED: 'success',
    PENDING: 'warning',
    REJECTED: 'danger',
    UNVERIFIED: 'neutral',
};

function formatPrice(amount: number | string) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
}

export default function OrganizerDetailPage() {
    const { organizerId } = useParams<{ organizerId: string }>();
    const router = useRouter();
    const [data, setData] = useState<OrganizerDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    async function load() {
        setIsLoading(true);
        const res = await apiClient.get<OrganizerDetail>(`/admin/organizers/${organizerId}`);
        setData(res);
        setIsLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizerId]);

    async function toggleSuspend() {
        if (!data) return;
        setBusy(true);
        const nextStatus = data.organizer.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        await apiClient.patch(`/admin/organizers/${organizerId}/status`, { status: nextStatus });
        await load();
        setBusy(false);
    }

    async function verify() {
        setBusy(true);
        await apiClient.patch(`/admin/organizers/${organizerId}/verification`, { verificationStatus: 'VERIFIED' });
        await load();
        setBusy(false);
    }

    if (isLoading || !data) {
        return (
            <>
                <Topbar title="Organizer" />
                <PageContainer>
                    <p className="text-sm text-[var(--color-gray-600)]">Memuat...</p>
                </PageContainer>
            </>
        );
    }

    const { organizer, staff, events, orders, recentAuditLogs } = data;

    return (
        <>
            <Topbar title={organizer.name} />
            <PageContainer>
                <button onClick={() => router.push('/organizers')} className="text-sm text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)] mb-4">
                    <i className="ri-arrow-left-line mr-1" />
                    Kembali ke daftar organizer
                </button>

                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {organizer.logoUrl && <img src={organizer.logoUrl} alt={organizer.name} className="w-12 h-12 rounded-full object-cover" />}
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-[var(--color-gray-900)]">{organizer.name}</h2>
                                <Badge tone={STATUS_TONE[organizer.status]}>{organizer.status}</Badge>
                                <Badge tone={VERIFICATION_TONE[organizer.verificationStatus]}>{organizer.verificationStatus}</Badge>
                            </div>
                            <p className="text-xs text-[var(--color-gray-600)]">/{organizer.slug} · Bergabung {new Date(organizer.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {organizer.verificationStatus !== 'VERIFIED' && (
                            <button disabled={busy} onClick={verify} className="text-sm text-primary font-medium hover:underline disabled:opacity-50">
                                Verifikasi
                            </button>
                        )}
                        <button
                            disabled={busy}
                            onClick={toggleSuspend}
                            className={`text-sm font-medium hover:underline disabled:opacity-50 ${organizer.status === 'SUSPENDED' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}
                        >
                            {organizer.status === 'SUSPENDED' ? 'Aktifkan' : 'Suspend'}
                        </button>
                    </div>
                </div>

                {organizer.description && <p className="text-sm text-[var(--color-gray-700)] mb-6 max-w-2xl">{organizer.description}</p>}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <SalesMetricCard label="Total Event" value={String(events.length)} icon="ri-calendar-event-line" />
                    <SalesMetricCard label="Pendapatan (Paid)" value={formatPrice(orders.revenue)} icon="ri-money-dollar-circle-line" />
                    <SalesMetricCard label="Order Paid" value={String(orders.byStatus.PAID ?? 0)} icon="ri-checkbox-circle-line" />
                    <SalesMetricCard label="Anggota Staff" value={String(staff.length)} icon="ri-team-line" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Event Terbaru</span>
                        </CardHeader>
                        <CardBody className="p-0">
                            {events.length === 0 ? (
                                <div className="p-5 text-sm text-[var(--color-gray-600)]">Belum ada event.</div>
                            ) : (
                                <ul className="divide-y divide-[var(--color-gray-100)]">
                                    {events.map((e) => (
                                        <li key={e.id} className="flex items-center justify-between px-5 py-2.5">
                                            <span className="text-sm text-[var(--color-gray-900)]">{e.title}</span>
                                            <EventStatusChip status={e.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Tim</span>
                        </CardHeader>
                        <CardBody className="p-0">
                            {staff.length === 0 ? (
                                <div className="p-5 text-sm text-[var(--color-gray-600)]">Belum ada staff.</div>
                            ) : (
                                <ul className="divide-y divide-[var(--color-gray-100)]">
                                    {staff.map((s) => (
                                        <li key={s.id} className="flex items-center justify-between px-5 py-2.5">
                                            <div>
                                                <p className="text-sm text-[var(--color-gray-900)]">{s.user.fullName}</p>
                                                <p className="text-xs text-[var(--color-gray-600)]">{s.user.email}</p>
                                            </div>
                                            <Badge tone="primary">{s.role}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <span className="text-sm font-semibold">Order Terbaru</span>
                    </CardHeader>
                    <CardBody className="p-0">
                        {orders.recent.length === 0 ? (
                            <div className="p-5 text-sm text-[var(--color-gray-600)]">Belum ada order.</div>
                        ) : (
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Kode</Th>
                                        <Th>Buyer</Th>
                                        <Th>Total</Th>
                                        <Th>Status</Th>
                                        <Th>Tanggal</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.recent.map((o) => (
                                        <tr key={o.id}>
                                            <Td className="font-mono text-xs">{o.orderCode}</Td>
                                            <Td>{o.buyerEmail}</Td>
                                            <Td>{formatPrice(o.totalAmount)}</Td>
                                            <Td><OrderStatusChip status={o.status} /></Td>
                                            <Td className="text-xs">{new Date(o.createdAt).toLocaleDateString('id-ID')}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </CardBody>
                </Card>

                {recentAuditLogs.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <span className="text-sm font-semibold">Riwayat Aksi Admin</span>
                        </CardHeader>
                        <CardBody className="p-0">
                            <ul className="divide-y divide-[var(--color-gray-100)]">
                                {recentAuditLogs.map((log) => (
                                    <li key={log.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                                        <span className="text-[var(--color-gray-900)]">{log.action}</span>
                                        <span className="text-xs text-[var(--color-gray-600)]">
                                            {log.actor?.fullName ?? 'System'} · {new Date(log.createdAt).toLocaleString('id-ID')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </CardBody>
                    </Card>
                )}
            </PageContainer>
        </>
    );
}