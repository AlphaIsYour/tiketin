// apps/api/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsService } from './notifications.service';
import { ResendEmailProvider } from './providers/resend-email.provider';
import { EMAIL_PROVIDER } from './email-provider.token';

@Module({
    imports: [PrismaModule],
    providers: [
        NotificationsService,
        ResendEmailProvider,
        { provide: EMAIL_PROVIDER, useExisting: ResendEmailProvider },
    ],
    exports: [NotificationsService],
})
export class NotificationsModule { }