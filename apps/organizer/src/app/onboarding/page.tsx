// apps/organizer/src/app/onboarding/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Textarea } from '@tiketin/ui';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [emailContact, setEmailContact] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) router.push('/login');
    }, [isAuthLoading, isAuthenticated, router]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await apiClient.post('/organizers', { name, description, emailContact: emailContact || undefined });
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membuat profil organizer');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isAuthLoading || !isAuthenticated) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-50)] px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <i className="ri-store-2-line text-2xl text-primary" />
                    <h1 className="text-lg font-semibold text-[var(--color-gray-900)] mt-2">Buat Profil Organizer</h1>
                    <p className="text-sm text-[var(--color-gray-600)] mt-1">
                        Diperlukan sebelum kamu bisa membuat event dan menjual tiket di Tiketin.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-6 space-y-4">
                    <div>
                        <Label>Nama Organizer</Label>
                        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Himpunan Mahasiswa Informatika" />
                    </div>
                    <div>
                        <Label>Deskripsi Singkat</Label>
                        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan tentang organisasi atau komunitas kamu" />
                    </div>
                    <div>
                        <Label>Email Kontak (opsional)</Label>
                        <Input type="email" value={emailContact} onChange={(e) => setEmailContact(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Membuat...' : 'Buat Profil & Lanjutkan'}
                    </Button>
                </form>
            </div>
        </div>
    );
}