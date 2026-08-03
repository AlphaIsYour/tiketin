// apps/organizer/src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Overview', icon: 'ri-dashboard-line' },
    { href: '/events', label: 'Events', icon: 'ri-calendar-event-line' },
    { href: '/orders', label: 'Orders', icon: 'ri-shopping-bag-line' },
    { href: '/attendees', label: 'Attendees', icon: 'ri-team-line' },
    { href: '/checkin', label: 'Check-in', icon: 'ri-qr-scan-line' },
    { href: '/storefront', label: 'Storefront', icon: 'ri-store-2-line' },
    { href: '/staff', label: 'Staff', icon: 'ri-shield-user-line' },
    { href: '/settings', label: 'Settings', icon: 'ri-settings-3-line' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 shrink-0 border-r border-[var(--color-gray-200)] bg-white h-screen sticky top-0 flex flex-col">
            <div className="h-14 flex items-center gap-2 px-5 border-b border-[var(--color-gray-100)]">
                <i className="ri-ticket-2-fill text-xl text-primary" />
                <span className="font-semibold text-[var(--color-gray-900)]">Tiketin</span>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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