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
        this.client = new Resend(process.env.RESEND_API_KEY);
        this.from = process.env.EMAIL_FROM as string;
    }

    async send(params: SendEmailParams): Promise<void> {
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