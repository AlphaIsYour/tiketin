// apps/api/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
    imports: [PrismaModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }