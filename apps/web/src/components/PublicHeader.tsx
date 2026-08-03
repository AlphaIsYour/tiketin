// apps/web/src/components/PublicHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function PublicHeader() {
    const { isAuthenticated, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="h-16 border-b border-[var(--color-gray-200)] flex items-center justify-between px-6 sticky top-0 bg-white z-10">
            <Link href="/" className="flex items-center gap-2">
                <i className="ri-ticket-2-fill text-xl text-primary" />
                <span className="font-semibold text-[var(--color-gray-900)]">Tiketin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
                <Link href="/orders" className="text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                    Tiket Saya
                </Link>
                {mounted && isAuthenticated ? (
                    <>
                        <Link href="/account" className="text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                            Akun
                        </Link>
                        <button onClick={logout} className="text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                            Keluar
                        </button>
                    </>
                ) : (
                    <Link href="/login" className="text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                        Masuk
                    </Link>
                )}
            </nav>
        </header>
    );
}