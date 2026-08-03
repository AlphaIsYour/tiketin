// apps/admin/src/components/layout/Topbar.tsx
'use client';

import { useAuth } from '@/lib/auth-context';

export function Topbar({ title }: { title: string }) {
    const { logout } = useAuth();
    return (
        <header className="h-14 border-b border-[var(--color-gray-200)] bg-white flex items-center justify-between px-6 sticky top-0 z-10">
            <h1 className="text-base font-semibold text-[var(--color-gray-900)]">{title}</h1>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                <i className="ri-logout-box-line text-base" />
                Sign out
            </button>
        </header>
    );
}