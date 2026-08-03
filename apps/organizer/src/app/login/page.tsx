// apps/organizer/src/app/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@tiketin/ui';
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
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-50)] px-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <i className="ri-ticket-2-fill text-2xl text-primary" />
                    <span className="text-lg font-semibold">Tiketin Organizer</span>
                </div>
                <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-gray-800)] mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-gray-800)] mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-gray-200)] text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
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