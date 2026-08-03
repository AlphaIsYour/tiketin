// apps/api/src/orders/dto/claim-order.dto.ts
import { IsString } from 'class-validator';

export class ClaimOrderDto {
    @IsString()
    token: string;
}