// apps/api/src/admin/dto/query-admin-events.dto.ts
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAdminEventsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'CANCELLED', 'COMPLETED'])
    status?: string;

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