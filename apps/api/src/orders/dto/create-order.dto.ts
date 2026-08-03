// apps/api/src/orders/dto/create-order.dto.ts
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class OrderItemInput {
    @IsString()
    ticketTypeId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    eventId: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemInput)
    items: OrderItemInput[];

    @IsString()
    buyerFullName: string;

    @IsEmail()
    buyerEmail: string;
}