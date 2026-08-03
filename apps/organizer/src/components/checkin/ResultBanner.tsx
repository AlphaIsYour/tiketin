// apps/organizer/src/components/checkin/ResultBanner.tsx
import { CheckInScanResult } from '@/lib/checkin-types';

const CONFIG: Record<CheckInScanResult['status'], { bg: string; icon: string; label: string }> = {
    SUCCESS: { bg: 'bg-[var(--color-success)]', icon: 'ri-checkbox-circle-fill', label: 'Tiket Valid — Masuk' },
    ALREADY_USED: { bg: 'bg-[var(--color-warning)]', icon: 'ri-error-warning-fill', label: 'Tiket Sudah Digunakan' },
    REJECTED: { bg: 'bg-[var(--color-danger)]', icon: 'ri-close-circle-fill', label: 'Tiket Tidak Valid' },
};

export function ResultBanner({ result }: { result: CheckInScanResult | null }) {
    if (!result) {
        return (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-200)] bg-white p-6 text-center">
                <i className="ri-qr-scan-2-line text-3xl text-[var(--color-gray-400)]" />
                <p className="text-sm text-[var(--color-gray-600)] mt-2">Arahkan kamera ke QR tiket peserta</p>
            </div>
        );
    }

    const config = CONFIG[result.status];

    return (
        <div className={`rounded-[var(--radius-md)] ${config.bg} text-white p-6 text-center`}>
            <i className={`${config.icon} text-4xl`} />
            <p className="text-base font-semibold mt-2">{config.label}</p>
            {result.status === 'ALREADY_USED' && result.usedAt && (
                <p className="text-xs opacity-90 mt-1">Check-in pada {new Date(result.usedAt).toLocaleTimeString('id-ID')}</p>
            )}
            {result.status === 'REJECTED' && result.ticketStatus && (
                <p className="text-xs opacity-90 mt-1">Status tiket: {result.ticketStatus}</p>
            )}
        </div>
    );
}