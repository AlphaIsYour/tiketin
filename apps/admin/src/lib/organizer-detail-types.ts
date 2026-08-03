// apps/admin/src/lib/organizer-detail-types.ts
export interface OrganizerDetail {
    organizer: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        status: string;
        verificationStatus: string;
        createdAt: string;
        storefront: { isPublic: boolean; themePreset: string } | null;
    };
    staff: { id: string; role: string; user: { fullName: string; email: string } }[];
    events: { id: string; title: string; status: string; eventStartAt: string }[];
    orders: {
        byStatus: Record<string, number>;
        revenue: number;
        recent: { id: string; orderCode: string; buyerEmail: string; status: string; totalAmount: string; createdAt: string }[];
    };
    recentAuditLogs: { id: string; action: string; createdAt: string; actor: { fullName: string } | null }[];
}