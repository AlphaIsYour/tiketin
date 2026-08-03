// apps/api/src/notifications/email-provider.interface.ts
export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export interface EmailProvider {
    send(params: SendEmailParams): Promise<void>;
}