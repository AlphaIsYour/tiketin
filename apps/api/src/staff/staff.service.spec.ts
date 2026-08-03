// apps/api/src/staff/staff.service.spec.ts
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StaffService } from './staff.service';

describe('StaffService.acceptInvite', () => {
    let prisma: any;
    let notificationsService: any;
    let service: StaffService;

    const pendingInvite = {
        id: 'invite-1',
        organizerId: 'org-1',
        email: 'staff@example.com',
        role: 'STAFF',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        invitedByUserId: 'owner-1',
    };

    beforeEach(() => {
        prisma = {
            organizerInvite: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
            $transaction: jest.fn(),
        };
        notificationsService = { sendStaffInviteEmail: jest.fn().mockResolvedValue(undefined) };
        service = new StaffService(prisma, notificationsService);
    });

    it('accepts a valid pending invite for a first-time member', async () => {
        prisma.organizerInvite.findUnique.mockResolvedValue({ ...pendingInvite });
        prisma.$transaction.mockImplementation(async (fn: any) =>
            fn({
                organizerMember: {
                    findUnique: jest.fn().mockResolvedValue(null),
                    create: jest.fn().mockResolvedValue({}),
                    update: jest.fn(),
                },
                organizerInvite: { update: jest.fn().mockResolvedValue({}) },
            }),
        );

        const result = await service.acceptInvite('token-abc', 'user-1', 'staff@example.com');

        expect(result).toEqual({ success: true, organizerId: 'org-1' });
    });

    it('rejects reusing the same invite token a second time', async () => {
        // Simulates the token already having been consumed by a prior accept call.
        prisma.organizerInvite.findUnique.mockResolvedValue({ ...pendingInvite, status: 'ACCEPTED' });

        await expect(service.acceptInvite('token-abc', 'user-1', 'staff@example.com')).rejects.toThrow(BadRequestException);
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an expired invite and marks it EXPIRED', async () => {
        prisma.organizerInvite.findUnique.mockResolvedValue({ ...pendingInvite, expiresAt: new Date(Date.now() - 1000) });

        await expect(service.acceptInvite('token-abc', 'user-1', 'staff@example.com')).rejects.toThrow(BadRequestException);
        expect(prisma.organizerInvite.update).toHaveBeenCalledWith({ where: { id: 'invite-1' }, data: { status: 'EXPIRED' } });
    });

    it('rejects acceptance from an email that does not match the invite', async () => {
        prisma.organizerInvite.findUnique.mockResolvedValue({ ...pendingInvite });

        await expect(service.acceptInvite('token-abc', 'user-1', 'someone-else@example.com')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for an unknown token', async () => {
        prisma.organizerInvite.findUnique.mockResolvedValue(null);

        await expect(service.acceptInvite('bad-token', 'user-1', 'staff@example.com')).rejects.toThrow(NotFoundException);
    });

    it('re-activates a previously removed membership instead of creating a duplicate row', async () => {
        prisma.organizerInvite.findUnique.mockResolvedValue({ ...pendingInvite });
        const memberUpdate = jest.fn().mockResolvedValue({});
        const memberCreate = jest.fn();
        prisma.$transaction.mockImplementation(async (fn: any) =>
            fn({
                organizerMember: {
                    findUnique: jest.fn().mockResolvedValue({ id: 'member-1', status: 'REMOVED' }),
                    update: memberUpdate,
                    create: memberCreate,
                },
                organizerInvite: { update: jest.fn().mockResolvedValue({}) },
            }),
        );

        await service.acceptInvite('token-abc', 'user-1', 'staff@example.com');

        expect(memberUpdate).toHaveBeenCalledWith({ where: { id: 'member-1' }, data: { role: 'STAFF', status: 'ACTIVE' } });
        expect(memberCreate).not.toHaveBeenCalled();
    });
});