// apps/api/src/orders/orders.controller.ts
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtPayload } from '@tiketin/auth';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClaimOrderDto } from './dto/claim-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post()
    @UseGuards(OptionalJwtAuthGuard)
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    create(@CurrentUser() user: JwtPayload | null, @Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto, user?.sub);
    }

    @Get(':orderId')
    @UseGuards(OptionalJwtAuthGuard)
    detail(
        @CurrentUser() user: JwtPayload | null,
        @Param('orderId') orderId: string,
        @Query('token') token?: string,
    ) {
        return this.ordersService.getOrderForViewer(orderId, user?.sub, token);
    }

    @Post(':orderId/claim')
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    claim(
        @CurrentUser() user: JwtPayload,
        @Param('orderId') orderId: string,
        @Body() dto: ClaimOrderDto,
    ) {
        return this.ordersService.claimGuestOrder(orderId, user.sub, dto.token);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    list(@CurrentUser() user: JwtPayload) {
        return this.ordersService.listForBuyer(user.sub);
    }
}