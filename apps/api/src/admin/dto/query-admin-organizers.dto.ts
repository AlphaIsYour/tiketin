// apps/api/src/admin/dto/query-admin-organizers.dto.ts
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAdminOrganizersDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    status?: string;

    @IsOptional()
    @IsIn(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'])
    verificationStatus?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}