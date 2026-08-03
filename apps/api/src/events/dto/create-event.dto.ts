// apps/api/src/events/dto/create-event.dto.ts
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { EventCapacityMode, EventVisibility } from '@prisma/client';

export class CreateEventDto {
    @IsString()
    @MinLength(3)
    title: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    shortDescription?: string;

    @IsOptional()
    @IsString()
    fullDescription?: string;

    @IsOptional()
    @IsString()
    bannerUrl?: string;

    @IsOptional()
    @IsString()
    venueName?: string;

    @IsOptional()
    @IsString()
    venueAddress?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsBoolean()
    isOnline?: boolean;

    @ValidateIf((o) => o.isOnline === true)
    @IsUrl()
    onlineUrl?: string;

    @IsDateString()
    eventStartAt: string;

    @IsDateString()
    eventEndAt: string;

    @IsOptional()
    @IsDateString()
    salesStartAt?: string;

    @IsOptional()
    @IsDateString()
    salesEndAt?: string;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsEnum(EventCapacityMode)
    capacityMode?: EventCapacityMode;

    @ValidateIf((o) => o.capacityMode === 'FIXED')
    @IsInt()
    @Min(1)
    capacityTotal?: number;

    @IsOptional()
    @IsEnum(EventVisibility)
    visibility?: EventVisibility;
}