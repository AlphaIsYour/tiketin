// apps/api/src/auth/decorators/platform-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { PlatformRole } from '@tiketin/auth';

export const PLATFORM_ROLES_KEY = 'platformRoles';
export const PlatformRoles = (...roles: PlatformRole[]) => SetMetadata(PLATFORM_ROLES_KEY, roles);