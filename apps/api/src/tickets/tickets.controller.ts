// apps/api/src/tickets/tickets.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private ticketsService: TicketsService) { }

    @Get()
    list(@CurrentUser() user: JwtPayload) {
        return this.ticketsService.listForBuyer(user.sub);
    }
}