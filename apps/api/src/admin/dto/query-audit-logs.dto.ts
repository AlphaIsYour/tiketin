// apps/api/src/admin/dto/query-audit-logs.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAuditLogsDto {
    @IsOptional()
    @IsString()
    entityType?: string;

    @IsOptional()
    @IsString()
    entityId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 30;
}