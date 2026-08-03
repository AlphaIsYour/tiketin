// apps/api/src/staff/dto/update-member-role.dto.ts
import { IsIn } from 'class-validator';

export class UpdateMemberRoleDto {
    @IsIn(['MANAGER', 'STAFF', 'SCANNER'])
    role: 'MANAGER' | 'STAFF' | 'SCANNER';
}