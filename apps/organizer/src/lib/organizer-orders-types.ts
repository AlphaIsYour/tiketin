// apps/organizer/src/lib/organizer-orders-types.ts
export interface OrganizerOrderRow {
    id: string;
    orderCode: string;
    buyerFullName: string;
    buyerEmail: string;
    totalAmount: string;
    status: string;
    createdAt: string;
    event: { title: string };
    items: { ticketTypeNameSnapshot: string; quantity: number }[];
}

export interface AttendeeRow {
    id: string;
    ticketCode: string;
    status: string;
    buyerEmail: string;
    issuedAt: string;
    usedAt: string | null;
    event: { title: string };
    ticketType: { name: string };
    order: { buyerFullName: string; orderCode: string };
}

export interface DashboardSummary {
    ticketsSold: number;
    checkedIn: number;
    activeEvents: number;
    revenue: number;
}