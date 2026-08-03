// apps/organizer/src/lib/organizer-types.ts
export interface EventDetail {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    fullDescription: string | null;
    bannerUrl: string | null;
    venueName: string | null;
    venueAddress: string | null;
    city: string | null;
    isOnline: boolean;
    onlineUrl: string | null;
    eventStartAt: string;
    eventEndAt: string;
    salesStartAt: string | null;
    salesEndAt: string | null;
    visibility: string;
    status: string;
    ticketTypes: TicketType[];
}

export interface TicketType {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stockTotal: number;
    stockSold: number;
    purchaseLimitPerUser: number | null;
    isActive: boolean;
    sortOrder: number;
}