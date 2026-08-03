// apps/api/src/staff/dto/invite-staff.dto.ts
import { IsEmail, IsIn } from 'class-validator';

export class InviteStaffDto {
    @IsEmail()
    email: string;

    @IsIn(['MANAGER', 'STAFF', 'SCANNER'])
    role: 'MANAGER' | 'STAFF' | 'SCANNER';
}