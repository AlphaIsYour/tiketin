// packages/auth/src/permissions.ts
export type OrganizerRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'SCANNER';

const ROLE_RANK: Record<OrganizerRole, number> = {
    OWNER: 4,
    MANAGER: 3,
    STAFF: 2,
    SCANNER: 1,
};

export function hasMinimumOrganizerRole(role: OrganizerRole, minimum: OrganizerRole): boolean {
    return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export const ORGANIZER_PERMISSIONS = {
    MANAGE_EVENT: 'MANAGER' as OrganizerRole,
    MANAGE_TICKET_TYPES: 'MANAGER' as OrganizerRole,
    MANAGE_STOREFRONT: 'MANAGER' as OrganizerRole,
    MANAGE_STAFF: 'OWNER' as OrganizerRole,
    VIEW_DASHBOARD: 'STAFF' as OrganizerRole,
    CHECK_IN: 'SCANNER' as OrganizerRole,
    VIEW_FINANCE: 'MANAGER' as OrganizerRole,
} as const;