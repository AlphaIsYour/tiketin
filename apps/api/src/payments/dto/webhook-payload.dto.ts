// apps/api/src/payments/dto/webhook-payload.dto.ts
import { IsIn, IsString } from 'class-validator';

export class WebhookPayloadDto {
    @IsString()
    providerReference: string;

    @IsIn(['PAID', 'FAILED', 'EXPIRED', 'CANCELLED'])
    status: 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
}