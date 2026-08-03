// apps/web/src/app/orders/[orderId]/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Badge, Button, Card, CardBody, CardHeader, OrderStatusChip } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { apiGet, apiPost } from '@/lib/api-client';
import { storeGuestOrderToken, getGuestOrderToken } from '@/lib/guest-orders';
import { useAuth } from '@/lib/auth-context';

interface OrderTicket {
    id: string;
    ticketCode: string;
    qrToken: string;
    status: string;
    ticketType: { name: string };
}

interface OrderDetail {
    id: string;
    orderCode: string;
    status: string;
    totalAmount: string;
    buyerFullName: string;
    buyerEmail: string;
    canClaim: boolean;
    tickets: OrderTicket[];
}

function formatPrice(amount: string) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
}

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const searchParams = useSearchParams();
    const { isAuthenticated, login, register } = useAuth();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [claimMode, setClaimMode] = useState<'login' | 'register'>('register');
    const [claimName, setClaimName] = useState('');
    const [claimEmail, setClaimEmail] = useState('');
    const [claimPassword, setClaimPassword] = useState('');
    const [isClaiming, setIsClaiming] = useState(false);

    const urlToken = searchParams.get('token');

    function resolveToken() {
        if (urlToken) {
            storeGuestOrderToken(orderId, urlToken);
            return urlToken;
        }
        return getGuestOrderToken(orderId);
    }

    async function loadOrder() {
        setIsLoading(true);
        setError(null);
        try {
            const token = resolveToken();
            const path = token ? `/orders/${orderId}?token=${token}` : `/orders/${orderId}`;
            const data = await apiGet<OrderDetail>(path);
            setOrder(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Tidak dapat memuat pesanan');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    async function handleClaim(e: FormEvent) {
        e.preventDefault();
        setIsClaiming(true);
        setError(null);
        try {
            if (claimMode === 'register') {
                await register(claimName, claimEmail, claimPassword);
            } else {
                await login(claimEmail, claimPassword);
            }
            const token = resolveToken();
            if (token) {
                await apiPost(`/orders/${orderId}/claim`, { token });
            }
            await loadOrder();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan tiket ke akun');
        } finally {
            setIsClaiming(false);
        }
    }

    if (isLoading) {
        return (
            <>
                <PublicHeader />
                <div className="p-6 text-sm text-[var(--color-gray-600)]">Memuat pesanan...</div>
            </>
        );
    }

    if (error && !order) {
        return (
            <>
                <PublicHeader />
                <div className="p-6 text-sm text-[var(--color-danger)]">{error}</div>
            </>
        );
    }

    if (!order) return null;

    return (
        <>
            <PublicHeader />
            <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Pesanan {order.orderCode}</span>
                        <OrderStatusChip status={order.status} />
                    </CardHeader>
                    <CardBody className="space-y-1 text-sm">
                        <p className="text-[var(--color-gray-700)]">{order.buyerFullName} · {order.buyerEmail}</p>
                        <p className="text-base font-semibold text-[var(--color-gray-900)]">{formatPrice(order.totalAmount)}</p>
                    </CardBody>
                </Card>

                {order.status === 'PENDING' && (
                    <p className="text-sm text-[var(--color-gray-600)]">Menunggu konfirmasi pembayaran. Halaman ini akan memperbarui status tiket setelah pembayaran diverifikasi.</p>
                )}

                {order.status === 'PAID' && order.tickets.length > 0 && (
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Tiket Kamu</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            {order.tickets.map((ticket) => (
                                <div key={ticket.id} className="flex items-center gap-4 border border-[var(--color-gray-100)] rounded-[var(--radius-md)] p-3">
                                    <QRCodeSVG value={ticket.qrToken} size={72} />
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-gray-900)]">{ticket.ticketType.name}</p>
                                        <p className="text-xs text-[var(--color-gray-600)] font-mono">{ticket.ticketCode}</p>
                                        <Badge tone={ticket.status === 'USED' ? 'neutral' : 'success'}>{ticket.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                )}

                {order.canClaim && !isAuthenticated && (
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Simpan tiket ke akun</span>
                        </CardHeader>
                        <CardBody>
                            <p className="text-xs text-[var(--color-gray-600)] mb-3">
                                Buat akun atau masuk untuk mengakses tiket ini kapan saja lewat riwayat pesanan.
                            </p>
                            <div className="flex gap-2 mb-3 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setClaimMode('register')}
                                    className={`px-3 py-1.5 rounded-[var(--radius-sm)] ${claimMode === 'register' ? 'bg-primary text-white' : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'}`}
                                >
                                    Buat Akun
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setClaimMode('login')}
                                    className={`px-3 py-1.5 rounded-[var(--radius-sm)] ${claimMode === 'login' ? 'bg-primary text-white' : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'}`}
                                >
                                    Sudah Punya Akun
                                </button>
                            </div>
                            <form onSubmit={handleClaim} className="space-y-3">
                                {claimMode === 'register' && (
                                    <input
                                        required
                                        placeholder="Nama lengkap"
                                        value={claimName}
                                        onChange={(e) => setClaimName(e.target.value)}
                                        className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm"
                                    />
                                )}
                                <input
                                    required
                                    type="email"
                                    placeholder="Email"
                                    value={claimEmail}
                                    onChange={(e) => setClaimEmail(e.target.value)}
                                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm"
                                />
                                <input
                                    required
                                    type="password"
                                    placeholder="Password"
                                    value={claimPassword}
                                    onChange={(e) => setClaimPassword(e.target.value)}
                                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm"
                                />
                                {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                                <Button type="submit" disabled={isClaiming} className="w-full">
                                    {isClaiming ? 'Menyimpan...' : 'Simpan Tiket ke Akun'}
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                )}
            </div>
        </>
    );
}