// apps/api/src/organizer-orders/dto/query-organizer-orders.dto.ts
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryOrganizerOrdersDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsIn(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED', 'REFUNDED_PARTIAL', 'REFUNDED_FULL'])
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