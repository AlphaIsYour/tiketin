// apps/api/src/payments/payments.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { MidtransNotificationDto } from './dto/midtrans-notification.dto';

@Controller('payments/webhook')
@SkipThrottle()
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('midtrans')
    @HttpCode(200)
    handleWebhook(@Body() dto: MidtransNotificationDto) {
        return this.paymentsService.handleWebhook(dto);
    }
}