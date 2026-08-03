// apps/web/src/app/login/page.tsx
'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label } from '@tiketin/ui';
import { PublicHeader } from '@/components/PublicHeader';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
            router.push(searchParams.get('redirect') ?? '/orders');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Email atau password salah');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Email</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <Label>Password</Label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <>
            <PublicHeader />
            <div className="max-w-sm mx-auto px-4 py-10">
                <h1 className="text-lg font-semibold text-[var(--color-gray-900)] mb-1">Masuk</h1>
                <p className="text-sm text-[var(--color-gray-600)] mb-6">Akses riwayat pesanan dan e-ticket kamu.</p>

                <Suspense fallback={<p className="text-sm text-[var(--color-gray-600)]">Memuat form...</p>}>
                    <LoginForm />
                </Suspense>

                <p className="text-sm text-[var(--color-gray-600)] mt-4 text-center">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-primary font-medium hover:underline">
                        Daftar
                    </Link>
                </p>
            </div>
        </>
    );
}