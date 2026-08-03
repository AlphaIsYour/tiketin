// apps/organizer/src/app/(dashboard)/storefront/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Input, Label, Textarea } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { StorefrontSettings, THEME_PRESETS } from '@/lib/storefront-types';

const PUBLIC_WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

export default function StorefrontSettingsPage() {
    const { organizer } = useOrganizer();
    const [settings, setSettings] = useState<StorefrontSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!organizer) return;
        apiClient
            .get<StorefrontSettings>(`/organizers/${organizer.organizerId}/storefront`)
            .then(setSettings)
            .finally(() => setIsLoading(false));
    }, [organizer]);

    function update<K extends keyof StorefrontSettings>(key: K, value: StorefrontSettings[K]) {
        setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
        setSaved(false);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!organizer || !settings) return;
        setError(null);
        setIsSaving(true);
        try {
            const updated = await apiClient.patch<StorefrontSettings>(`/organizers/${organizer.organizerId}/storefront`, settings);
            setSettings(updated);
            setSaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan storefront');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading || !settings) {
        return (
            <>
                <Topbar title="Storefront" />
                <PageContainer>
                    <p className="text-sm text-[var(--color-gray-600)]">Memuat...</p>
                </PageContainer>
            </>
        );
    }

    const publicUrl = organizer ? `${PUBLIC_WEB_URL}/o/${organizer.organizer.slug}` : '';

    return (
        <>
            <Topbar title="Storefront" />
            <PageContainer>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[var(--color-gray-600)]">Sesuaikan halaman publik organizer kamu.</p>
                    {organizer && (
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-primary font-medium hover:underline">
                            Lihat Halaman Publik <i className="ri-external-link-line" />
                        </a>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Konten Utama</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>Headline</Label>
                                <Input
                                    value={settings.headline ?? ''}
                                    onChange={(e) => update('headline', e.target.value)}
                                    placeholder="Contoh: Event kampus dan komunitas terbaik"
                                />
                            </div>
                            <div>
                                <Label>Subheadline</Label>
                                <Textarea
                                    rows={2}
                                    value={settings.subheadline ?? ''}
                                    onChange={(e) => update('subheadline', e.target.value)}
                                    placeholder="Deskripsi singkat organizer kamu"
                                />
                            </div>
                            <div>
                                <Label>Cover Image URL</Label>
                                <Input
                                    value={settings.coverImageUrl ?? ''}
                                    onChange={(e) => update('coverImageUrl', e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Tampilan</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>Tema</Label>
                                <select
                                    value={settings.themePreset}
                                    onChange={(e) => update('themePreset', e.target.value)}
                                    className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm"
                                >
                                    {THEME_PRESETS.map((preset) => (
                                        <option key={preset.value} value={preset.value}>
                                            {preset.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Warna Aksen</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={settings.accentColor}
                                        onChange={(e) => update('accentColor', e.target.value)}
                                        className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] cursor-pointer"
                                    />
                                    <Input value={settings.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="font-mono" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Call to Action</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>Label Tombol</Label>
                                <Input
                                    value={settings.ctaLabel ?? ''}
                                    onChange={(e) => update('ctaLabel', e.target.value)}
                                    placeholder="Contoh: Lihat Semua Event"
                                />
                            </div>
                            <div>
                                <Label>URL Tombol (opsional)</Label>
                                <Input value={settings.ctaUrl ?? ''} onChange={(e) => update('ctaUrl', e.target.value)} placeholder="https://..." />
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-gray-900)]">Halaman Publik Aktif</p>
                                <p className="text-xs text-[var(--color-gray-600)]">Nonaktifkan untuk menyembunyikan storefront dari publik.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => update('isPublic', !settings.isPublic)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${settings.isPublic ? 'bg-primary' : 'bg-[var(--color-gray-200)]'}`}
                            >
                                <span
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.isPublic ? 'translate-x-5' : 'translate-x-0.5'}`}
                                />
                            </button>
                        </CardBody>
                    </Card>

                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                    {saved && <p className="text-sm text-[var(--color-success)]">Pengaturan storefront disimpan.</p>}

                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </form>
            </PageContainer>
        </>
    );
}