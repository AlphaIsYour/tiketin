// apps/organizer/src/lib/organizer-profile-types.ts
export interface OrganizerProfile {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    emailContact: string | null;
    phoneContact: string | null;
    instagramUrl: string | null;
    websiteUrl: string | null;
    verificationStatus: string;
    status: string;
}