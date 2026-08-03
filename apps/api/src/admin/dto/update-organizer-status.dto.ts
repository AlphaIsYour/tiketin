// apps/api/src/admin/dto/update-organizer-status.dto.ts
import { IsIn } from 'class-validator';

export class UpdateOrganizerStatusDto {
    @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export class UpdateOrganizerVerificationDto {
    @IsIn(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'])
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}