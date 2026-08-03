// apps/organizer/src/lib/checkin-types.ts
export type CheckInResultStatus = 'SUCCESS' | 'ALREADY_USED' | 'REJECTED';

export interface CheckInScanResult {
    status: CheckInResultStatus;
    usedAt?: string;
    ticketStatus?: string;
}

export interface AttendanceSummary {
    totalTickets: number;
    usedTickets: number;
    remaining: number;
}

export interface CheckinEventOption {
    id: string;
    title: string;
    status: string;
    eventStartAt: string;
}