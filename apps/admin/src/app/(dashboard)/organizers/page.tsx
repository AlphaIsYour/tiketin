// apps/admin/src/app/(dashboard)/organizers/page.tsx (edit: link rows to detail page instead of inline-only actions)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Input, Table, Td, Th } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { apiClient } from '@/lib/api-client';

interface OrganizerRow {
    id: string;
    name: string;
    slug: string;
    status: string;
    verificationStatus: string;
    _count: { events: number };
}

const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    ACTIVE: 'success',
    INACTIVE: 'neutral',
    SUSPENDED: 'danger',
};

const VERIFICATION_TONE: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    VERIFIED: 'success',
    PENDING: 'warning',
    REJECTED: 'danger',
    UNVERIFIED: 'neutral',
};

export default function OrganizersPage() {
    const [organizers, setOrganizers] = useState<OrganizerRow[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    async function load() {
        setIsLoading(true);
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await apiClient.get<{ items: OrganizerRow[] }>(`/admin/organizers${query}`);
        setOrganizers(res.items);
        setIsLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Topbar title="Organizers" />
            <PageContainer>
                <div className="mb-4 flex items-center gap-2">
                    <Input
                        placeholder="Cari nama atau slug organizer"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && load()}
                        className="max-w-xs"
                    />
                </div>

                <div className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)]">
                    {isLoading ? (
                        <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Organizer</Th>
                                    <Th>Events</Th>
                                    <Th>Status</Th>
                                    <Th>Verifikasi</Th>
                                    <Th></Th>
                                </tr>
                            </thead>
                            <tbody>
                                {organizers.map((o) => (
                                    <tr key={o.id}>
                                        <Td className="font-medium">
                                            {o.name}
                                            <div className="text-xs text-[var(--color-gray-600)] font-normal">/{o.slug}</div>
                                        </Td>
                                        <Td>{o._count.events}</Td>
                                        <Td><Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge></Td>
                                        <Td><Badge tone={VERIFICATION_TONE[o.verificationStatus]}>{o.verificationStatus}</Badge></Td>
                                        <Td>
                                            <Link href={`/organizers/${o.id}`} className="text-primary text-sm font-medium hover:underline">
                                                Detail
                                            </Link>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            </PageContainer>
        </>
    );
}