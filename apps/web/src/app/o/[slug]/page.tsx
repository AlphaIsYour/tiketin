// apps/web/src/app/o/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@tiketin/ui';
import { apiGet } from '@/lib/api-client';
import { PublicStorefront } from '@/lib/storefront-types';
import { THEME_PRESET_STYLES } from '@/lib/theme-presets';

function formatFromPrice(ticketTypes: { price: string }[]) {
    if (ticketTypes.length === 0) return null;
    const price = Number(ticketTypes[0].price);
    if (price === 0) return 'Gratis';
    return `Mulai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}`;
}

export default function OrganizerStorefrontPage() {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<PublicStorefront | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        apiGet<PublicStorefront>(`/storefronts/${slug}`)
            .then(setData)
            .catch(() => setNotFound(true))
            .finally(() => setIsLoading(false));
    }, [slug]);

    if (isLoading) {
        return <div className="p-6 text-sm text-[var(--color-gray-600)]">Memuat...</div>;
    }

    if (notFound || !data) {
        return <div className="p-6 text-sm text-[var(--color-gray-600)]">Halaman organizer tidak ditemukan.</div>;
    }

    const { organizer, storefront, events } = data;
    const theme = THEME_PRESET_STYLES[storefront.themePreset] ?? THEME_PRESET_STYLES.default;

    return (
        <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh' }}>
            <div className="max-w-2xl mx-auto">
                {storefront.coverImageUrl && (
                    <img src={storefront.coverImageUrl} alt="" className="w-full aspect-[3/1] object-cover" />
                )}

                <div className="px-5 pt-6 pb-10 text-center">
                    {organizer.logoUrl && (
                        <img
                            src={organizer.logoUrl}
                            alt={organizer.name}
                            className="w-20 h-20 rounded-full mx-auto object-cover border-4"
                            style={{ borderColor: theme.bg, marginTop: storefront.coverImageUrl ? -48 : 0 }}
                        />
                    )}
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                        <h1 className="text-xl font-semibold">{organizer.name}</h1>
                        {organizer.isVerified && <i className="ri-verified-badge-fill" style={{ color: storefront.accentColor }} />}
                    </div>

                    {storefront.headline && <p className="text-base font-medium mt-1">{storefront.headline}</p>}
                    {(storefront.subheadline || organizer.description) && (
                        <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: theme.muted }}>
                            {storefront.subheadline ?? organizer.description}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-3 mt-4">
                        {organizer.instagramUrl && (
                            <a href={organizer.instagramUrl} target="_blank" rel="noreferrer" style={{ color: theme.muted }}>
                                <i className="ri-instagram-line text-lg" />
                            </a>
                        )}
                        {organizer.websiteUrl && (
                            <a href={organizer.websiteUrl} target="_blank" rel="noreferrer" style={{ color: theme.muted }}>
                                <i className="ri-global-line text-lg" />
                            </a>
                        )}
                    </div>

                    {storefront.ctaLabel && (
                        <a
                            href={storefront.ctaUrl ?? '#events'}
                            className="inline-block mt-5 px-5 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold text-white"
                            style={{ backgroundColor: storefront.accentColor }}
                        >
                            {storefront.ctaLabel}
                        </a>
                    )}
                </div>

                <div id="events" className="px-5 pb-10 space-y-3">
                    {events.length === 0 ? (
                        <p className="text-sm text-center" style={{ color: theme.muted }}>
                            Belum ada event aktif saat ini.
                        </p>
                    ) : (
                        events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="flex items-center gap-3 border rounded-[var(--radius-md)] p-3 hover:opacity-90 transition-opacity"
                                style={{ borderColor: theme.muted + '33' }}
                            >
                                {event.bannerUrl && (
                                    <img src={event.bannerUrl} alt={event.title} className="w-16 h-16 rounded-[var(--radius-sm)] object-cover shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{event.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: theme.muted }}>
                                        {new Date(event.eventStartAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        {event.city ? ` · ${event.city}` : ''}
                                    </p>
                                    {formatFromPrice(event.ticketTypes) && (
                                        <Badge tone="primary">{formatFromPrice(event.ticketTypes)}</Badge>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <div className="text-center pb-6">
                    <span className="text-xs" style={{ color: theme.muted }}>
                        Dipersembahkan oleh <span className="font-medium">Tiketin</span>
                    </span>
                </div>
            </div>
        </div>
    );
}