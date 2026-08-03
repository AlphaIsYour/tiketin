// apps/api/src/organizer-orders/dto/query-attendees.dto.ts
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAttendeesDto {
    @IsOptional()
    @IsString()
    eventId?: string;

    @IsOptional()
    @IsIn(['ISSUED', 'USED', 'CANCELLED', 'REFUNDED', 'INVALIDATED'])
    status?: string;

    @IsOptional()
    @IsString()
    search?: string;

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