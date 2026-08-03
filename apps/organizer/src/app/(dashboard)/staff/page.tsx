// apps/organizer/src/app/(dashboard)/staff/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, CardHeader, EmptyState } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { InviteStaffModal } from '@/components/staff/InviteStaffModal';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { PendingInvite, StaffMember } from '@/lib/staff-types';

const ROLE_LABEL: Record<string, string> = {
    OWNER: 'Owner',
    MANAGER: 'Manager',
    STAFF: 'Staff',
    SCANNER: 'Petugas Check-in',
};

export default function StaffPage() {
    const { organizer } = useOrganizer();
    const [members, setMembers] = useState<StaffMember[]>([]);
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const isOwner = organizer?.role === 'OWNER';

    async function load() {
        if (!organizer) return;
        setIsLoading(true);
        const [membersRes, invitesRes] = await Promise.all([
            apiClient.get<StaffMember[]>(`/organizers/${organizer.organizerId}/staff`),
            apiClient.get<PendingInvite[]>(`/organizers/${organizer.organizerId}/staff/invites`),
        ]);
        setMembers(membersRes);
        setInvites(invitesRes);
        setIsLoading(false);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizer]);

    async function handleRevoke(inviteId: string) {
        if (!organizer) return;
        await apiClient.request(`/organizers/${organizer.organizerId}/staff/invites/${inviteId}`, { method: 'DELETE' });
        await load();
    }

    async function handleRemove(memberId: string) {
        if (!organizer) return;
        await apiClient.request(`/organizers/${organizer.organizerId}/staff/${memberId}`, { method: 'DELETE' });
        await load();
    }

    return (
        <>
            <Topbar title="Staff" />
            <PageContainer>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[var(--color-gray-600)]">Kelola tim yang membantu operasional event.</p>
                    {isOwner && (
                        <Button onClick={() => setModalOpen(true)}>
                            <i className="ri-user-add-line" />
                            Undang Staff
                        </Button>
                    )}
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <span className="text-sm font-semibold">Anggota Tim</span>
                    </CardHeader>
                    <CardBody className="p-0">
                        {isLoading ? (
                            <div className="p-5 text-sm text-[var(--color-gray-600)]">Memuat...</div>
                        ) : (
                            <ul className="divide-y divide-[var(--color-gray-100)]">
                                {members.map((m) => (
                                    <li key={m.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-gray-900)]">{m.user.fullName}</p>
                                            <p className="text-xs text-[var(--color-gray-600)]">{m.user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge tone="primary">{ROLE_LABEL[m.role]}</Badge>
                                            {isOwner && m.role !== 'OWNER' && (
                                                <button onClick={() => handleRemove(m.id)} className="text-xs text-[var(--color-danger)] hover:underline">
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardBody>
                </Card>

                {invites.length > 0 && (
                    <Card>
                        <CardHeader>
                            <span className="text-sm font-semibold">Undangan Tertunda</span>
                        </CardHeader>
                        <CardBody className="p-0">
                            <ul className="divide-y divide-[var(--color-gray-100)]">
                                {invites.map((invite) => (
                                    <li key={invite.id} className="flex items-center justify-between px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-gray-900)]">{invite.email}</p>
                                            <p className="text-xs text-[var(--color-gray-600)]">
                                                Berlaku sampai {new Date(invite.expiresAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge tone="warning">{ROLE_LABEL[invite.role]}</Badge>
                                            {isOwner && (
                                                <button onClick={() => handleRevoke(invite.id)} className="text-xs text-[var(--color-danger)] hover:underline">
                                                    Batalkan
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardBody>
                    </Card>
                )}

                {!isLoading && members.length === 0 && invites.length === 0 && (
                    <EmptyState icon="ri-shield-user-line" title="Belum ada staff" description="Undang staff untuk membantu mengelola event dan check-in." />
                )}

                {organizer && (
                    <InviteStaffModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        organizerId={organizer.organizerId}
                        onInvited={load}
                    />
                )}
            </PageContainer>
        </>
    );
}