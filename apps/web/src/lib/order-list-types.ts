// apps/web/src/lib/order-list-types.ts
export interface BuyerOrderListItem {
    id: string;
    orderCode: string;
    status: string;
    totalAmount: string;
    createdAt: string;
    event: { title: string; slug: string; bannerUrl: string | null };
    items: { ticketTypeNameSnapshot: string; quantity: number }[];
}