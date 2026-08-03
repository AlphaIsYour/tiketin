// apps/organizer/src/components/checkin/AttendanceSummaryBar.tsx
import { AttendanceSummary } from '@/lib/checkin-types';

export function AttendanceSummaryBar({ summary }: { summary: AttendanceSummary | null }) {
    if (!summary) return null;

    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-200)] bg-white p-3 text-center">
                <p className="text-lg font-semibold text-[var(--color-gray-900)]">{summary.totalTickets}</p>
                <p className="text-xs text-[var(--color-gray-600)]">Total Tiket</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-200)] bg-white p-3 text-center">
                <p className="text-lg font-semibold text-[var(--color-success)]">{summary.usedTickets}</p>
                <p className="text-xs text-[var(--color-gray-600)]">Sudah Masuk</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-gray-200)] bg-white p-3 text-center">
                <p className="text-lg font-semibold text-[var(--color-gray-900)]">{summary.remaining}</p>
                <p className="text-xs text-[var(--color-gray-600)]">Belum Masuk</p>
            </div>
        </div>
    );
}