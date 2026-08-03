// apps/web/src/lib/account-types.ts
export interface BuyerProfile {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
}