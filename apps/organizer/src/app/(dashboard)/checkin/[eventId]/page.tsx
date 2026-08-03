// apps/organizer/src/app/(dashboard)/checkin/[eventId]/page.tsx
'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Input } from '@tiketin/ui';
import { Topbar } from '@/components/layout/Topbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { QrScanner } from '@/components/checkin/QrScanner';
import { ResultBanner } from '@/components/checkin/ResultBanner';
import { AttendanceSummaryBar } from '@/components/checkin/AttendanceSummaryBar';
import { useOrganizer } from '@/lib/use-organizer';
import { apiClient } from '@/lib/api-client';
import { AttendanceSummary, CheckInScanResult } from '@/lib/checkin-types';

const RESULT_COOLDOWN_MS = 2500;

export default function ScannerPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const { organizer } = useOrganizer();
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const [result, setResult] = useState<CheckInScanResult | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [manualError, setManualError] = useState<string | null>(null);
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);

    const basePath = organizer ? `/organizers/${organizer.organizerId}/events/${eventId}/checkin` : null;

    const loadSummary = useCallback(async () => {
        if (!basePath) return;
        const data = await apiClient.get<AttendanceSummary>(`${basePath}/summary`);
        setSummary(data);
    }, [basePath]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    function vibrateFor(status: CheckInScanResult['status']) {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;
        if (status === 'SUCCESS') navigator.vibrate(80);
        else navigator.vibrate([60, 60, 60]);
    }

    async function submitScan(qrToken: string) {
        if (!basePath) return;
        setIsPaused(true);
        try {
            const data = await apiClient.post<CheckInScanResult>(`${basePath}/scan`, { qrToken });
            setResult(data);
            vibrateFor(data.status);
            await loadSummary();
        } catch {
            setResult({ status: 'REJECTED' });
            vibrateFor('REJECTED');
        } finally {
            setTimeout(() => setIsPaused(false), RESULT_COOLDOWN_MS);
        }
    }

    async function submitManual(e: FormEvent) {
        e.preventDefault();
        if (!basePath || !manualCode) return;
        setManualError(null);
        setIsSubmittingManual(true);
        try {
            const data = await apiClient.post<CheckInScanResult>(`${basePath}/manual`, { ticketCode: manualCode });
            setResult(data);
            vibrateFor(data.status);
            setManualCode('');
            await loadSummary();
        } catch (err) {
            setManualError(err instanceof Error ? err.message : 'Kode tiket tidak ditemukan');
        } finally {
            setIsSubmittingManual(false);
        }
    }

    return (
        <>
            <Topbar title="Scanner Check-in" />
            <PageContainer>
                <div className="max-w-md mx-auto space-y-4">
                    <AttendanceSummaryBar summary={summary} />

                    <ResultBanner result={result} />

                    <div className="flex gap-2 text-sm">
                        <button
                            onClick={() => setMode('camera')}
                            className={`flex-1 py-2 rounded-[var(--radius-sm)] font-medium ${mode === 'camera' ? 'bg-primary text-white' : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'
                                }`}
                        >
                            <i className="ri-camera-line mr-1.5" />
                            Scan Kamera
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={`flex-1 py-2 rounded-[var(--radius-sm)] font-medium ${mode === 'manual' ? 'bg-primary text-white' : 'bg-[var(--color-gray-100)] text-[var(--color-gray-700)]'
                                }`}
                        >
                            <i className="ri-keyboard-line mr-1.5" />
                            Input Manual
                        </button>
                    </div>

                    {mode === 'camera' ? (
                        <QrScanner onDecode={submitScan} isPaused={isPaused} />
                    ) : (
                        <form onSubmit={submitManual} className="bg-white border border-[var(--color-gray-200)] rounded-[var(--radius-md)] p-4 space-y-3">
                            <Input
                                placeholder="Masukkan kode tiket"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                className="font-mono"
                                autoFocus
                            />
                            {manualError && <p className="text-sm text-[var(--color-danger)]">{manualError}</p>}
                            <Button type="submit" disabled={isSubmittingManual || !manualCode} className="w-full">
                                {isSubmittingManual ? 'Memeriksa...' : 'Validasi Tiket'}
                            </Button>
                        </form>
                    )}
                </div>
            </PageContainer>
        </>
    );
}