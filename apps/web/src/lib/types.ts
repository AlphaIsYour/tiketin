// apps/web/src/lib/types.ts
export interface TicketTypeDto {
    id: string;
    name: string;
    description: string | null;
    price: string;
    currency: string;
    stockTotal: number;
    stockSold: number;
    purchaseLimitPerUser: number | null;
    isActive: boolean;
}

export interface EventDetailDto {
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
    eventStartAt: string;
    eventEndAt: string;
    organizer: { id: string; name: string; slug: string; logoUrl: string | null };
    ticketTypes: TicketTypeDto[];
}