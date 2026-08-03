// apps/admin/src/app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-gray-600)]">Loading...</div>;
    }

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}