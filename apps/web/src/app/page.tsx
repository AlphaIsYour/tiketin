// apps/web/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Input } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { apiGet } from '@/lib/api-client';
import { EventDetailDto } from '@/lib/types';

interface PaginatedEvents {
    items: EventDetailDto[];
    total: number;
    page: number;
    limit: number;
}

function formatFromPrice(ticketTypes?: { price: string; currency: string }[]) {
    if (!ticketTypes || ticketTypes.length === 0) return null;
    const price = Number(ticketTypes[0].price);
    if (price === 0) return 'Gratis';
    return `Mulai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}`;
}

export default function HomePage() {
    const [events, setEvents] = useState<EventDetailDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        apiGet<PaginatedEvents | EventDetailDto[]>('/events')
            .then((res) => {
                if (Array.isArray(res)) {
                    setEvents(res);
                } else if (res && Array.isArray(res.items)) {
                    setEvents(res.items);
                } else {
                    setEvents([]);
                }
            })
            .catch(() => setEvents([]))
            .finally(() => setIsLoading(false));
    }, []);

    const eventList = Array.isArray(events) ? events : [];

    const filteredEvents = eventList.filter((e) =>
        (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
        (e.city && e.city.toLowerCase().includes(search.toLowerCase())) ||
        (e.organizer?.name && e.organizer.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-gray-50)] text-[var(--color-gray-900)]">
            <PublicHeader />

            {/* Hero Section */}
            <section className="bg-white border-b border-[var(--color-gray-200)] py-12 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <Badge tone="primary">Tiketin Platform</Badge>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-gray-900)]">
                        Temukan Event Seru & Konser Musik Pilihan
                    </h1>
                    <p className="text-base text-[var(--color-gray-600)] max-w-2xl mx-auto">
                        Beli tiket resmi secara langsung, aman, cepat, dan tanpa ribet. E-ticket dengan QR Code instant dikirim ke email kamu.
                    </p>

                    <div className="max-w-md mx-auto pt-2">
                        <Input
                            placeholder="Cari event, kota, atau penyelenggara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm shadow-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Events List */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[var(--color-gray-900)]">Event Mendatang</h2>
                    <span className="text-xs text-[var(--color-gray-600)]">{filteredEvents.length} event ditemukan</span>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-sm text-[var(--color-gray-600)]">Memuat daftar event...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="py-16 text-center bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-8">
                        <i className="ri-calendar-event-line text-4xl text-[var(--color-gray-400)] mb-3 block" />
                        <h3 className="text-base font-semibold text-[var(--color-gray-900)]">Belum ada event ditemukan</h3>
                        <p className="text-sm text-[var(--color-gray-600)] mt-1">Coba kata kunci pencarian lain atau cek kembali nanti.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                            >
                                {event.bannerUrl ? (
                                    <img src={event.bannerUrl} alt={event.title} className="w-full aspect-[16/9] object-cover" />
                                ) : (
                                    <div className="w-full aspect-[16/9] bg-[var(--color-gray-100)] flex items-center justify-center text-[var(--color-gray-400)]">
                                        <i className="ri-image-line text-3xl" />
                                    </div>
                                )}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {event.organizer?.name && (
                                                <span className="text-xs text-[var(--color-gray-600)] truncate">{event.organizer.name}</span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-semibold text-[var(--color-gray-900)] line-clamp-2">{event.title}</h3>
                                    </div>
                                    <div className="pt-2 border-t border-[var(--color-gray-100)] flex items-center justify-between">
                                        <div className="text-xs text-[var(--color-gray-600)]">
                                            <p>{new Date(event.eventStartAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                            <p className="font-medium text-[var(--color-gray-900)] mt-0.5">{event.city ?? (event.isOnline ? 'Online' : '-')}</p>
                                        </div>
                                        {formatFromPrice(event.ticketTypes) && (
                                            <Badge tone="primary">{formatFromPrice(event.ticketTypes)}</Badge>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[var(--color-gray-200)] py-6 px-6 text-center text-xs text-[var(--color-gray-600)]">
                <p>&copy; {new Date().getFullYear()} Tiketin. Platform Ticketing & Event Management Indonesia.</p>
            </footer>
        </div>
    );
}
