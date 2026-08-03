// apps/web/src/app/register/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await register(fullName, email, password);
            router.push('/orders');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membuat akun');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <PublicHeader />
            <div className="max-w-sm mx-auto px-4 py-10">
                <h1 className="text-lg font-semibold text-[var(--color-gray-900)] mb-1">Buat Akun</h1>
                <p className="text-sm text-[var(--color-gray-600)] mb-6">Simpan tiket dan pantau riwayat pesanan kamu.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Nama Lengkap</Label>
                        <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <Label>Password</Label>
                        <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Memproses...' : 'Buat Akun'}
                    </Button>
                </form>

                <p className="text-sm text-[var(--color-gray-600)] mt-4 text-center">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Masuk
                    </Link>
                </p>
            </div>
        </>
    );
}