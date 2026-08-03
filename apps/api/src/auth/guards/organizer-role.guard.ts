// apps/api/src/auth/guards/organizer-role.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasMinimumOrganizerRole, JwtPayload, OrganizerRole } from '@tiketin/auth';
import { PrismaService } from '../../prisma/prisma.service';
import { ORGANIZER_ROLES_KEY } from '../decorators/organizer-roles.decorator';

@Injectable()
export class OrganizerRoleGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<OrganizerRole[]>(ORGANIZER_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required || required.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;
        const organizerId = request.params?.organizerId;
        if (!user || !organizerId) throw new ForbiddenException('Organizer context required');

        const member = await this.prisma.organizerMember.findFirst({
            where: { organizerId, userId: user.sub, status: 'ACTIVE' },
        });
        if (!member) throw new ForbiddenException('Not a member of this organizer');

        if (!hasMinimumOrganizerRole(member.role as OrganizerRole, required[0])) {
            throw new ForbiddenException('Insufficient organizer role');
        }

        request.organizerMember = member;
        return true;
    }
}