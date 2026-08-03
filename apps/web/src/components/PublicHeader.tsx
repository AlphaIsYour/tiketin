// apps/web/src/components/PublicHeader.tsx
import Link from 'next/link';

export function PublicHeader() {
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
                <Link href="/login" className="text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)]">
                    Masuk
                </Link>
            </nav>
        </header>
    );
}