// apps/organizer/src/lib/staff-types.ts
export interface StaffMember {
    id: string;
    role: 'OWNER' | 'MANAGER' | 'STAFF' | 'SCANNER';
    user: { id: string; fullName: string; email: string; avatarUrl: string | null };
}

export interface PendingInvite {
    id: string;
    email: string;
    role: 'MANAGER' | 'STAFF' | 'SCANNER';
    expiresAt: string;
    createdAt: string;
}