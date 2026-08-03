// apps/admin/src/app/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label } from '@tiketin/ui';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login gagal atau akun bukan admin');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-900)] px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <i className="ri-shield-star-line text-2xl text-primary" />
                    <span className="text-lg font-semibold text-white">Tiketin Admin</span>
                </div>
                <form onSubmit={handleSubmit} className="bg-white rounded-[var(--radius-md)] p-6 space-y-4">
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
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </div>
        </div>
    );
}