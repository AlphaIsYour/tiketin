// apps/api/src/notifications/providers/resend-email.provider.ts
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { EmailProvider, SendEmailParams } from '../email-provider.interface';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
    private readonly logger = new Logger(ResendEmailProvider.name);
    private client: Resend;
    private from: string;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY || 're_dev_placeholder_key_12345';
        this.client = new Resend(apiKey);
        this.from = process.env.EMAIL_FROM || 'Tiketin <no-reply@tiketin.id>';
    }

    async send(params: SendEmailParams): Promise<void> {
        if (!process.env.RESEND_API_KEY) {
            this.logger.warn(`RESEND_API_KEY not configured. Mocking email send to ${params.to}: ${params.subject}`);
            return;
        }

        const result = await this.client.emails.send({
            from: this.from,
            to: params.to,
            subject: params.subject,
            html: params.html,
        });

        if (result.error) {
            this.logger.error(`Failed to send email to ${params.to}: ${result.error.message}`);
            throw new Error(result.error.message);
        }
    }
}