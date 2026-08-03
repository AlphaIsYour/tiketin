// apps/organizer/src/components/events/TicketTypeFormModal.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Input, Label, Modal, Textarea } from '@tiketin/ui';
import { apiClient } from '@/lib/api-client';
import { TicketType } from '@/lib/organizer-types';

export function TicketTypeFormModal({
    isOpen,
    onClose,
    organizerId,
    eventId,
    editing,
    onSaved,
}: {
    isOpen: boolean;
    onClose: () => void;
    organizerId: string;
    eventId: string;
    editing: TicketType | null;
    onSaved: () => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0');
    const [stockTotal, setStockTotal] = useState('100');
    const [purchaseLimitPerUser, setPurchaseLimitPerUser] = useState('4');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editing) {
            setName(editing.name);
            setDescription(editing.description ?? '');
            setPrice(editing.price);
            setStockTotal(String(editing.stockTotal));
            setPurchaseLimitPerUser(String(editing.purchaseLimitPerUser ?? 4));
        } else {
            setName('');
            setDescription('');
            setPrice('0');
            setStockTotal('100');
            setPurchaseLimitPerUser('4');
        }
    }, [editing, isOpen]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const payload = {
                name,
                description,
                price: Number(price),
                stockTotal: Number(stockTotal),
                purchaseLimitPerUser: Number(purchaseLimitPerUser),
            };
            if (editing) {
                await apiClient.patch(`/organizers/${organizerId}/events/${eventId}/ticket-types/${editing.id}`, payload);
            } else {
                await apiClient.post(`/organizers/${organizerId}/events/${eventId}/ticket-types`, payload);
            }
            onSaved();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan tiket');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Tipe Tiket' : 'Tambah Tipe Tiket'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Nama Tiket</Label>
                    <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Early Bird" />
                </div>
                <div>
                    <Label>Deskripsi</Label>
                    <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Harga (IDR)</Label>
                        <Input type="number" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div>
                        <Label>Kuota</Label>
                        <Input type="number" min={1} required value={stockTotal} onChange={(e) => setStockTotal(e.target.value)} />
                    </div>
                </div>
                <div>
                    <Label>Batas Pembelian per Pembeli</Label>
                    <Input type="number" min={1} value={purchaseLimitPerUser} onChange={(e) => setPurchaseLimitPerUser(e.target.value)} />
                </div>
                {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}