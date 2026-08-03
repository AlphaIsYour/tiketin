// apps/api/src/ticket-types/dto/create-ticket-type.dto.ts
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTicketTypeDto {
    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsInt()
    @Min(1)
    stockTotal: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    purchaseLimitPerUser?: number;

    @IsOptional()
    @IsDateString()
    saleStartAt?: string;

    @IsOptional()
    @IsDateString()
    saleEndAt?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsInt()
    sortOrder?: number;
}