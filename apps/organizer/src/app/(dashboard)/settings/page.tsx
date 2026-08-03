// apps/organizer/src/app/(dashboard)/settings/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, Input, Label, Textarea } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { OrganizerProfile } from '@/lib/organizer-profile-types';

const VERIFICATION_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    VERIFIED: 'success',
    PENDING: 'warning',
    REJECTED: 'danger',
    UNVERIFIED: 'neutral',
};

export default function SettingsPage() {
    const { organizer } = useOrganizer();
    const [profile, setProfile] = useState<OrganizerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const canEdit = organizer?.role === 'OWNER' || organizer?.role === 'MANAGER';

    useEffect(() => {
        if (!organizer) return;
        apiClient
            .get<OrganizerProfile>(`/organizers/${organizer.organizerId}`)
            .then(setProfile)
            .finally(() => setIsLoading(false));
    }, [organizer]);

    function update<K extends keyof OrganizerProfile>(key: K, value: OrganizerProfile[K]) {
        setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
        setSaved(false);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!organizer || !profile) return;
        setError(null);
        setIsSaving(true);
        try {
            const updated = await apiClient.patch<OrganizerProfile>(`/organizers/${organizer.organizerId}`, {
                name: profile.name,
                description: profile.description,
                logoUrl: profile.logoUrl,
                bannerUrl: profile.bannerUrl,
                emailContact: profile.emailContact,
                phoneContact: profile.phoneContact,
                instagramUrl: profile.instagramUrl,
                websiteUrl: profile.websiteUrl,
            });
            setProfile(updated);
            setSaved(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan profil');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading || !profile) {
        return (
            <>
                <Topbar title="Settings" />
                <PageContainer>
                    <p className="text-sm text-[var(--color-gray-600)]">Memuat...</p>
                </PageContainer>
            </>
        );
    }

    return (
        <>
            <Topbar title="Settings" />
            <PageContainer>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-[var(--color-gray-600)]">Status verifikasi:</span>
                    <Badge tone={VERIFICATION_TONE[profile.verificationStatus]}>{profile.verificationStatus}</Badge>
                </div>

                <form onSubmit={handleSubmit} className="max-w-xl">
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Profil Organizer</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>Nama Organizer</Label>
                                <Input required disabled={!canEdit} value={profile.name} onChange={(e) => update('name', e.target.value)} />
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea rows={3} disabled={!canEdit} value={profile.description ?? ''} onChange={(e) => update('description', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Logo URL</Label>
                                    <Input disabled={!canEdit} value={profile.logoUrl ?? ''} onChange={(e) => update('logoUrl', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Banner URL</Label>
                                    <Input disabled={!canEdit} value={profile.bannerUrl ?? ''} onChange={(e) => update('bannerUrl', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email Kontak</Label>
                                    <Input type="email" disabled={!canEdit} value={profile.emailContact ?? ''} onChange={(e) => update('emailContact', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Telepon Kontak</Label>
                                    <Input disabled={!canEdit} value={profile.phoneContact ?? ''} onChange={(e) => update('phoneContact', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Instagram</Label>
                                    <Input disabled={!canEdit} value={profile.instagramUrl ?? ''} onChange={(e) => update('instagramUrl', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Website</Label>
                                    <Input disabled={!canEdit} value={profile.websiteUrl ?? ''} onChange={(e) => update('websiteUrl', e.target.value)} />
                                </div>
                            </div>

                            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                            {saved && <p className="text-sm text-[var(--color-success)]">Profil disimpan.</p>}

                            {canEdit && (
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            )}
                        </CardBody>
                    </Card>
                </form>
            </PageContainer>
        </>
    );
}