// apps/organizer/src/app/invites/[token]/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Input, Label } from '@tiketin/ui';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface InvitePreview {
    organizerName: string;
    organizerLogoUrl: string | null;
    email: string;
    role: string;
}

const ROLE_LABEL: Record<string, string> = {
    MANAGER: 'Manager',
    STAFF: 'Staff',
    SCANNER: 'Petugas Check-in',
};

export default function AcceptInvitePage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const { isAuthenticated, login, register } = useAuth();

    const [invite, setInvite] = useState<InvitePreview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        apiClient
            .get<InvitePreview>(`/staff-invites/${token}`)
            .then(setInvite)
            .catch((err) => setError(err instanceof Error ? err.message : 'Undangan tidak valid'))
            .finally(() => setIsLoading(false));
    }, [token]);

    async function acceptNow() {
        setError(null);
        try {
            await apiClient.post(`/staff-invites/${token}/accept`);
            setAccepted(true);
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menerima undangan');
        }
    }

    useEffect(() => {
        if (isAuthenticated && invite && !accepted) acceptNow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, invite]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!invite) return;
        setIsSubmitting(true);
        setError(null);
        try {
            if (mode === 'register') {
                await register(fullName, invite.email, password);
            } else {
                await login(invite.email, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal masuk atau mendaftar');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-gray-600)]">Memuat undangan...</div>;
    }

    if (error && !invite) {
        return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-danger)]">{error}</div>;
    }

    if (!invite) return null;

    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <i className="ri-checkbox-circle-fill text-3xl text-[var(--color-success)]" />
                    <p className="text-sm font-medium text-[var(--color-gray-900)] mt-2">Undangan diterima</p>
                    <p className="text-xs text-[var(--color-gray-600)] mt-1">Mengarahkan ke dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-50)] px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-6">
                    {invite.organizerLogoUrl && (
                        <img src={invite.organizerLogoUrl} alt={invite.organizerName} className="w-12 h-12 rounded-full mx-auto mb-3 object-cover" />
                    )}
                    <p className="text-sm text-[var(--color-gray-600)]">Kamu diundang bergabung dengan</p>
                    <p className="text-lg font-semibold text-[var(--color-gray-900)]">{invite.organizerName}</p>
                    <p className="text-sm text-primary-dark font-medium mt-1">sebagai {ROLE_LABEL[invite.role]}</p>
                </div>

                <div className="flex gap-2 mb-4 text-xs">
                    <button
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2 rounded-[var(--radius-sm)] ${mode === 'register' ? 'bg-primary text-white' : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'}`}
                    >
                        Buat Akun Baru
                    </button>
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 rounded-[var(--radius-sm)] ${mode === 'login' ? 'bg-primary text-white' : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'}`}
                    >
                        Sudah Punya Akun
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-6 space-y-4">
                    <div>
                        <Label>Email</Label>
                        <Input value={invite.email} disabled className="bg-[var(--color-gray-50)]" />
                    </div>
                    {mode === 'register' && (
                        <div>
                            <Label>Nama Lengkap</Label>
                            <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        </div>
                    )}
                    <div>
                        <Label>Password</Label>
                        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Memproses...' : mode === 'register' ? 'Buat Akun & Terima' : 'Masuk & Terima'}
                    </Button>
                </form>
            </div>
        </div>
    );
}