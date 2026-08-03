// apps/web/src/lib/storefront-types.ts
export interface PublicStorefront {
    organizer: {
        name: string;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        bannerUrl: string | null;
        instagramUrl: string | null;
        websiteUrl: string | null;
        isVerified: boolean;
    };
    storefront: {
        headline: string | null;
        subheadline: string | null;
        accentColor: string;
        themePreset: string;
        coverImageUrl: string | null;
        ctaLabel: string | null;
        ctaUrl: string | null;
    };
    events: {
        id: string;
        title: string;
        slug: string;
        bannerUrl: string | null;
        city: string | null;
        eventStartAt: string;
        ticketTypes: { price: string }[];
    }[];
}