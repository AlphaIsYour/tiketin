// apps/organizer/src/app/(dashboard)/events/new/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Textarea } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';

export default function NewEventPage() {
    const router = useRouter();
    const { organizer } = useOrganizer();
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [city, setCity] = useState('');
    const [venueName, setVenueName] = useState('');
    const [eventStartAt, setEventStartAt] = useState('');
    const [eventEndAt, setEventEndAt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!organizer) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const event = await apiClient.post<{ id: string }>(`/organizers/${organizer.organizerId}/events`, {
                title,
                shortDescription,
                city,
                venueName,
                eventStartAt: new Date(eventStartAt).toISOString(),
                eventEndAt: new Date(eventEndAt).toISOString(),
            });
            router.push(`/events/${event.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal membuat event');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Topbar title="Buat Event" />
            <PageContainer>
                <form onSubmit={handleSubmit} className="max-w-xl space-y-4 bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-6">
                    <div>
                        <Label>Judul Event</Label>
                        <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Seminar Nasional Teknologi 2026" />
                    </div>
                    <div>
                        <Label>Deskripsi Singkat</Label>
                        <Textarea rows={3} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Kota</Label>
                            <Input value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div>
                            <Label>Venue</Label>
                            <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Mulai</Label>
                            <Input type="datetime-local" required value={eventStartAt} onChange={(e) => setEventStartAt(e.target.value)} />
                        </div>
                        <div>
                            <Label>Selesai</Label>
                            <Input type="datetime-local" required value={eventEndAt} onChange={(e) => setEventEndAt(e.target.value)} />
                        </div>
                    </div>
                    {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => router.push('/events')}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                        </Button>
                    </div>
                </form>
            </PageContainer>
        </>
    );
}