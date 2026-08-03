// apps/admin/src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/organizers', label: 'Organizers', icon: 'ri-store-2-line' },
    { href: '/events', label: 'Events', icon: 'ri-calendar-event-line' },
    { href: '/orders', label: 'Orders', icon: 'ri-shopping-bag-line' },
    { href: '/audit-logs', label: 'Audit Log', icon: 'ri-history-line' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 shrink-0 border-r border-[var(--color-gray-200)] bg-white h-screen sticky top-0 flex flex-col">
            <div className="h-14 flex items-center gap-2 px-5 border-b border-[var(--color-gray-100)]">
                <i className="ri-shield-star-line text-xl text-primary" />
                <span className="font-semibold text-[var(--color-gray-900)]">Admin</span>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${active
                                    ? 'bg-[#e8f4fb] text-primary-dark'
                                    : 'text-[var(--color-gray-600)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-900)]'
                                }`}
                        >
                            <i className={`${item.icon} text-base`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}