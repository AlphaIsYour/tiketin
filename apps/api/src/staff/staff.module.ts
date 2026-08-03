// apps/api/src/staff/staff.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { InviteAcceptController } from './invite-accept.controller';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [StaffController, InviteAcceptController],
    providers: [StaffService],
})
export class StaffModule { }