// apps/api/src/me/me.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MeService } from './me.service';
import { MeController } from './me.controller';

@Module({
    imports: [PrismaModule],
    controllers: [MeController],
    providers: [MeService],
})
export class MeModule { }