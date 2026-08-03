// apps/api/src/checkin/checkin.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';

@Module({
    imports: [PrismaModule],
    controllers: [CheckinController],
    providers: [CheckinService],
})
export class CheckinModule { }