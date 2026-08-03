// apps/api/src/staff/staff.service.ts
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { generateInviteToken } from '@tiketin/core';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class StaffService {
    constructor(private prisma: PrismaService, private notificationsService: NotificationsService) { }

    async listMembers(organizerId: string) {
        return this.prisma.organizerMember.findMany({
            where: { organizerId, status: 'ACTIVE' },
            include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    async listPendingInvites(organizerId: string) {
        return this.prisma.organizerInvite.findMany({
            where: { organizerId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
    }

    async inviteStaff(organizerId: string, invitedByUserId: string, dto: InviteStaffDto) {
        const normalizedEmail = dto.email.toLowerCase().trim();

        const existingMember = await this.prisma.organizerMember.findFirst({
            where: { organizerId, status: 'ACTIVE', user: { email: normalizedEmail } },
        });
        if (existingMember) throw new ConflictException('This email is already an active staff member');

        const existingInvite = await this.prisma.organizerInvite.findFirst({
            where: { organizerId, email: normalizedEmail, status: 'PENDING' },
        });
        if (existingInvite) throw new ConflictException('An invite is already pending for this email');

        const organizer = await this.prisma.organizer.findUniqueOrThrow({ where: { id: organizerId } });

        const invite = await this.prisma.organizerInvite.create({
            data: {
                organizerId,
                email: normalizedEmail,
                role: dto.role,
                token: generateInviteToken(),
                invitedByUserId,
                expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
            },
        });

        void this.notificationsService.sendStaffInviteEmail({
            email: normalizedEmail,
            organizerName: organizer.name,
            role: dto.role,
            token: invite.token,
        });

        return invite;
    }

    async revokeInvite(organizerId: string, inviteId: string) {
        const invite = await this.prisma.organizerInvite.findFirst({ where: { id: inviteId, organizerId } });
        if (!invite) throw new NotFoundException('Invite not found');
        if (invite.status !== 'PENDING') throw new BadRequestException('Only pending invites can be revoked');

        return this.prisma.organizerInvite.update({ where: { id: inviteId }, data: { status: 'REVOKED' } });
    }

    async updateMemberRole(organizerId: string, memberId: string, dto: UpdateMemberRoleDto) {
        const member = await this.prisma.organizerMember.findFirst({ where: { id: memberId, organizerId, status: 'ACTIVE' } });
        if (!member) throw new NotFoundException('Staff member not found');
        if (member.role === 'OWNER') throw new ForbiddenException('Owner role cannot be changed');

        return this.prisma.organizerMember.update({ where: { id: memberId }, data: { role: dto.role } });
    }

    async removeMember(organizerId: string, memberId: string) {
        const member = await this.prisma.organizerMember.findFirst({ where: { id: memberId, organizerId, status: 'ACTIVE' } });
        if (!member) throw new NotFoundException('Staff member not found');
        if (member.role === 'OWNER') throw new ForbiddenException('Owner cannot be removed');

        return this.prisma.organizerMember.update({ where: { id: memberId }, data: { status: 'REMOVED' } });
    }

    async previewInvite(token: string) {
        const invite = await this.prisma.organizerInvite.findUnique({
            where: { token },
            include: { organizer: { select: { name: true, logoUrl: true } } },
        });
        if (!invite) throw new NotFoundException('Invite not found');
        if (invite.status !== 'PENDING') throw new BadRequestException('This invite is no longer valid');
        if (invite.expiresAt < new Date()) throw new BadRequestException('This invite has expired');

        return {
            organizerName: invite.organizer.name,
            organizerLogoUrl: invite.organizer.logoUrl,
            email: invite.email,
            role: invite.role,
        };
    }

    async acceptInvite(token: string, userId: string, userEmail: string) {
        const invite = await this.prisma.organizerInvite.findUnique({ where: { token } });
        if (!invite) throw new NotFoundException('Invite not found');
        if (invite.status !== 'PENDING') throw new BadRequestException('This invite is no longer valid');
        if (invite.expiresAt < new Date()) {
            await this.prisma.organizerInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } });
            throw new BadRequestException('This invite has expired');
        }
        if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new ForbiddenException('This invite was sent to a different email address');
        }

        await this.prisma.$transaction(async (tx) => {
            const existingMembership = await tx.organizerMember.findUnique({
                where: { organizerId_userId: { organizerId: invite.organizerId, userId } },
            });

            if (existingMembership) {
                await tx.organizerMember.update({
                    where: { id: existingMembership.id },
                    data: { role: invite.role, status: 'ACTIVE' },
                });
            } else {
                await tx.organizerMember.create({
                    data: {
                        organizerId: invite.organizerId,
                        userId,
                        role: invite.role,
                        status: 'ACTIVE',
                        invitedByUserId: invite.invitedByUserId,
                    },
                });
            }

            await tx.organizerInvite.update({
                where: { id: invite.id },
                data: { status: 'ACCEPTED', acceptedAt: new Date() },
            });
        });

        return { success: true, organizerId: invite.organizerId };
    }
}