// apps/web/src/app/checkout/page.tsx (edit: guest checkout, no auth required, store guest token)
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { apiGet, apiPost } from '@/lib/api-client';
import { storeGuestOrderToken } from '@/lib/guest-orders';
import { EventDetailDto } from '@/lib/types';

interface CheckoutDraft {
    eventId: string;
    items: { ticketTypeId: string; quantity: number }[];
}

interface CreateOrderResponse {
    order: { id: string; orderCode: string; totalAmount: string };
    payment: { redirectUrl: string };
    guestAccessToken: string;
}

function formatPrice(amount: number, currency = 'IDR') {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export default function CheckoutPage() {
    const router = useRouter();
    const [draft, setDraft] = useState<CheckoutDraft | null>(null);
    const [event, setEvent] = useState<EventDetailDto | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('tiketin_checkout_draft');
        if (!raw) {
            router.push('/');
            return;
        }
        const parsed: CheckoutDraft = JSON.parse(raw);
        setDraft(parsed);
        apiGet<EventDetailDto>(`/events/by-id/${parsed.eventId}`).then(setEvent).catch(() => null);
    }, [router]);

    const lineItems = draft && event
        ? draft.items.map((item) => {
            const type = event.ticketTypes.find((t) => t.id === item.ticketTypeId)!;
            return { ...item, type };
        })
        : [];

    const subtotal = lineItems.reduce((sum, li) => sum + Number(li.type?.price ?? 0) * li.quantity, 0);
    const fee = Math.round(subtotal * 0.03);
    const total = subtotal + fee;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!draft) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const result = await apiPost<CreateOrderResponse>('/orders', {
                eventId: draft.eventId,
                items: draft.items,
                buyerFullName: fullName,
                buyerEmail: email,
            });
            storeGuestOrderToken(result.order.id, result.guestAccessToken);
            sessionStorage.removeItem('tiketin_checkout_draft');
            window.location.href = result.payment.redirectUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Checkout gagal, silakan coba lagi');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!draft) return null;

    return (
        <>
            <PublicHeader />
            <div className="max-w-lg mx-auto px-4 py-6">
                <h1 className="text-lg font-semibold text-[var(--color-gray-900)] mb-1">Checkout</h1>
                <p className="text-sm text-[var(--color-gray-600)] mb-4">
                    Tidak perlu akun untuk membeli tiket. Kamu bisa menyimpan tiket ke akun setelah pembayaran berhasil.
                </p>

                <Card className="mb-4">
                    <CardHeader>
                        <span className="text-sm font-semibold">Ringkasan Pesanan</span>
                    </CardHeader>
                    <CardBody className="space-y-2">
                        {lineItems.map((li) => (
                            <div key={li.ticketTypeId} className="flex items-center justify-between text-sm">
                                <span className="text-[var(--color-gray-700)]">
                                    {li.type?.name ?? 'Tiket'} x{li.quantity}
                                </span>
                                <span className="font-medium text-[var(--color-gray-900)]">
                                    {formatPrice(Number(li.type?.price ?? 0) * li.quantity)}
                                </span>
                            </div>
                        ))}
                        <div className="border-t border-[var(--color-gray-100)] pt-2 flex items-center justify-between text-sm">
                            <span className="text-[var(--color-gray-700)]">Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-gray-700)]">Biaya layanan</span>
                            <span>{formatPrice(fee)}</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-semibold pt-1">
                            <span>Total</span>
                            <span className="text-primary-dark">{formatPrice(total)}</span>
                        </div>
                    </CardBody>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Data Pembeli</span>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-gray-800)] mb-1">Nama Lengkap</label>
                                <input
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-gray-800)] mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-[var(--color-gray-600)] mt-1">Tautan tiket dan status pesanan akan tersedia lewat halaman ini setelah pembayaran.</p>
                            </div>
                        </CardBody>
                    </Card>

                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Memproses...' : `Bayar ${formatPrice(total)}`}
                    </Button>
                </form>
            </div>
        </>
    );
}