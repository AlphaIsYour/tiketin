// apps/api/src/auth/decorators/organizer-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { OrganizerRole } from '@tiketin/auth';

export const ORGANIZER_ROLES_KEY = 'organizerRoles';
export const OrganizerRoles = (...roles: OrganizerRole[]) => SetMetadata(ORGANIZER_ROLES_KEY, roles);