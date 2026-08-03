// apps/api/src/auth/guards/platform-roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload, PlatformRole } from '@tiketin/auth';
import { PLATFORM_ROLES_KEY } from '../decorators/platform-roles.decorator';

@Injectable()
export class PlatformRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<PlatformRole[]>(PLATFORM_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required || required.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;
        if (!user || !required.includes(user.platformRole)) {
            throw new ForbiddenException('Insufficient platform role');
        }
        return true;
    }
}