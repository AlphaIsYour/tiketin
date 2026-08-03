// apps/web/src/app/events/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { apiGet } from '@/lib/api-client';
import { EventDetailDto } from '@/lib/types';

function formatPrice(price: string, currency: string) {
    const amount = Number(price);
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export default function EventDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const [event, setEvent] = useState<EventDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        apiGet<EventDetailDto>(`/events/${slug}`)
            .then(setEvent)
            .finally(() => setIsLoading(false));
    }, [slug]);

    function setQty(ticketTypeId: string, qty: number, max: number) {
        setQuantities((prev) => ({ ...prev, [ticketTypeId]: Math.max(0, Math.min(qty, max)) }));
    }

    const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);
    const total = event
        ? selectedItems.reduce((sum, [ticketTypeId, qty]) => {
            const type = event.ticketTypes.find((t) => t.id === ticketTypeId);
            return sum + (type ? Number(type.price) * qty : 0);
        }, 0)
        : 0;

    function handleContinue() {
        if (!event || selectedItems.length === 0) return;
        const items = selectedItems.map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
        sessionStorage.setItem('tiketin_checkout_draft', JSON.stringify({ eventId: event.id, items }));
        router.push('/checkout');
    }

    if (isLoading) {
        return (
            <>
                <PublicHeader />
                <div className="p-6 text-sm text-[var(--color-gray-600)]">Memuat event...</div>
            </>
        );
    }

    if (!event) {
        return (
            <>
                <PublicHeader />
                <div className="p-6 text-sm text-[var(--color-gray-600)]">Event tidak ditemukan.</div>
            </>
        );
    }

    return (
        <>
            <PublicHeader />
            <div className="max-w-3xl mx-auto px-4 py-6">
                {event.bannerUrl && (
                    <img src={event.bannerUrl} alt={event.title} className="w-full aspect-[16/7] object-cover rounded-[var(--radius-md)] mb-5" />
                )}

                <div className="flex items-center gap-2 mb-2">
                    {event.organizer.logoUrl && (
                        <img src={event.organizer.logoUrl} alt={event.organizer.name} className="w-6 h-6 rounded-full object-cover" />
                    )}
                    <span className="text-sm text-[var(--color-gray-600)]">{event.organizer.name}</span>
                </div>

                <h1 className="text-2xl font-semibold text-[var(--color-gray-900)] mb-3">{event.title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-[var(--color-gray-700)] mb-6">
                    <div className="flex items-center gap-1.5">
                        <i className="ri-calendar-line text-primary" />
                        {new Date(event.eventStartAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <i className="ri-map-pin-line text-primary" />
                        {event.isOnline ? 'Online' : event.venueName ?? event.city ?? '-'}
                    </div>
                </div>

                {event.shortDescription && (
                    <p className="text-sm text-[var(--color-gray-700)] mb-8 leading-relaxed">{event.shortDescription}</p>
                )}

                <h2 className="text-sm font-semibold text-[var(--color-gray-900)] mb-3">Pilih Tiket</h2>
                <div className="space-y-3 mb-24">
                    {event.ticketTypes.map((type) => {
                        const available = type.stockTotal - type.stockSold;
                        const soldOut = available <= 0;
                        const qty = quantities[type.id] ?? 0;
                        const max = Math.min(available, type.purchaseLimitPerUser ?? available);

                        return (
                            <div
                                key={type.id}
                                className="border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-4 flex items-center justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-[var(--color-gray-900)]">{type.name}</p>
                                        {soldOut && <Badge tone="danger">Habis</Badge>}
                                    </div>
                                    {type.description && <p className="text-xs text-[var(--color-gray-600)] mt-0.5">{type.description}</p>}
                                    <p className="text-sm font-semibold text-primary-dark mt-1">{formatPrice(type.price, type.currency)}</p>
                                </div>

                                {!soldOut && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQty(type.id, qty - 1, max)}
                                            disabled={qty === 0}
                                            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] flex items-center justify-center disabled:opacity-40"
                                        >
                                            <i className="ri-subtract-line" />
                                        </button>
                                        <span className="w-5 text-center text-sm font-medium">{qty}</span>
                                        <button
                                            onClick={() => setQty(type.id, qty + 1, max)}
                                            disabled={qty >= max}
                                            className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] flex items-center justify-center disabled:opacity-40"
                                        >
                                            <i className="ri-add-line" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[var(--color-gray-200)] px-4 py-3">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-xs text-[var(--color-gray-600)]">Total</p>
                            <p className="text-base font-semibold text-[var(--color-gray-900)]">
                                {formatPrice(String(total), event.ticketTypes[0]?.currency ?? 'IDR')}
                            </p>
                        </div>
                        <Button onClick={handleContinue}>Lanjut Checkout</Button>
                    </div>
                </div>
            )}
        </>
    );
}