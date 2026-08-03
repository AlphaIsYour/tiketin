// apps/web/src/app/account/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Label } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { useAuth } from '@/lib/auth-context';
import { apiGet, apiRequest } from '@/lib/api-client';
import { BuyerProfile } from '@/lib/account-types';

export default function AccountSettingsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [profile, setProfile] = useState<BuyerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSaved, setProfileSaved] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSaved, setPasswordSaved] = useState(false);

    useEffect(() => {
        if (isAuthLoading) return;
        if (!isAuthenticated) {
            router.push('/login?redirect=/account');
            return;
        }
        apiGet<BuyerProfile>('/me')
            .then(setProfile)
            .finally(() => setIsLoading(false));
    }, [isAuthLoading, isAuthenticated, router]);

    function update<K extends keyof BuyerProfile>(key: K, value: BuyerProfile[K]) {
        setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
        setProfileSaved(false);
    }

    async function handleProfileSubmit(e: FormEvent) {
        e.preventDefault();
        if (!profile) return;
        setProfileError(null);
        setIsSavingProfile(true);
        try {
            const updated = await apiRequest<BuyerProfile>('/me', {
                method: 'PATCH',
                body: JSON.stringify({ fullName: profile.fullName, phoneNumber: profile.phoneNumber }),
            });
            setProfile(updated);
            setProfileSaved(true);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Gagal menyimpan profil');
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        setPasswordError(null);
        setIsSavingPassword(true);
        try {
            await apiRequest('/me/password', {
                method: 'PATCH',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            setCurrentPassword('');
            setNewPassword('');
            setPasswordSaved(true);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password');
        } finally {
            setIsSavingPassword(false);
        }
    }

    if (isAuthLoading || isLoading || !profile) {
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
            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
                <h1 className="text-lg font-semibold text-[var(--color-gray-900)]">Pengaturan Akun</h1>

                <form onSubmit={handleProfileSubmit}>
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Profil</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>Email</Label>
                                <Input value={profile.email} disabled className="bg-[var(--color-gray-50)]" />
                            </div>
                            <div>
                                <Label>Nama Lengkap</Label>
                                <Input required value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} />
                            </div>
                            <div>
                                <Label>Nomor Telepon</Label>
                                <Input value={profile.phoneNumber ?? ''} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="08xxxxxxxxxx" />
                            </div>
                            {profileError && <p className="text-sm text-[var(--color-danger)]">{profileError}</p>}
                            {profileSaved && <p className="text-sm text-[var(--color-success)]">Profil disimpan.</p>}
                            <Button type="submit" disabled={isSavingProfile}>
                                {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                            </Button>
                        </CardBody>
                    </Card>
                </form>

                <form onSubmit={handlePasswordSubmit}>
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Ubah Password</span>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>Password Saat Ini</Label>
                                <Input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            </div>
                            <div>
                                <Label>Password Baru</Label>
                                <Input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            {passwordError && <p className="text-sm text-[var(--color-danger)]">{passwordError}</p>}
                            {passwordSaved && <p className="text-sm text-[var(--color-success)]">Password berhasil diubah. Sesi lain telah keluar otomatis.</p>}
                            <Button type="submit" disabled={isSavingPassword}>
                                {isSavingPassword ? 'Menyimpan...' : 'Ubah Password'}
                            </Button>
                        </CardBody>
                    </Card>
                </form>
            </div>
        </>
    );
}