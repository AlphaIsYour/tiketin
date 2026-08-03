// apps/organizer/src/components/staff/InviteStaffModal.tsx
'use client';

import { FormEvent, useState } from 'react';
import { Button, Input, Label, Modal } from '@tiketin/ui';
import { apiClient } from '@/lib/api-client';

const ROLE_OPTIONS = [
    { value: 'MANAGER', label: 'Manager — kelola event, tiket, dan penjualan' },
    { value: 'STAFF', label: 'Staff — lihat dashboard dan data penjualan' },
    { value: 'SCANNER', label: 'Petugas Check-in — hanya validasi tiket' },
];

export function InviteStaffModal({
    isOpen,
    onClose,
    organizerId,
    onInvited,
}: {
    isOpen: boolean;
    onClose: () => void;
    organizerId: string;
    onInvited: () => void;
}) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('STAFF');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await apiClient.post(`/organizers/${organizerId}/staff/invites`, { email, role });
            setEmail('');
            setRole('STAFF');
            onInvited();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal mengirim undangan');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Undang Staff">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Email</Label>
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
                </div>
                <div>
                    <Label>Peran</Label>
                    <div className="space-y-2">
                        {ROLE_OPTIONS.map((opt) => (
                            <label
                                key={opt.value}
                                className={`flex items-start gap-2 p-3 rounded-[var(--radius-sm)] border cursor-pointer text-sm ${role === opt.value ? 'border-primary bg-[#e8f4fb]' : 'border-[var(--color-gray-200)]'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={opt.value}
                                    checked={role === opt.value}
                                    onChange={() => setRole(opt.value)}
                                    className="mt-0.5"
                                />
                                <span className="text-[var(--color-gray-800)]">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Undangan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}