// apps/admin/src/app/layout.tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
    title: 'Tiketin Admin',
    description: 'Internal platform administration for Tiketin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}