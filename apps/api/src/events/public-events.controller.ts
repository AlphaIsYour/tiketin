// apps/api/src/events/public-events.controller.ts (edit: add by-id lookup used by checkout page)
import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { QueryEventsDto } from './dto/query-events.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('events')
export class PublicEventsController {
    constructor(private eventsService: EventsService, private prisma: PrismaService) { }

    @Get()
    list(@Query() query: QueryEventsDto) {
        return this.eventsService.listPublic(query);
    }

    @Get('by-id/:id')
    async detailById(@Param('id') id: string) {
        const event = await this.prisma.event.findFirst({
            where: { id, status: 'PUBLISHED', visibility: 'PUBLIC', deletedAt: null },
            include: {
                organizer: { select: { id: true, name: true, slug: true, logoUrl: true } },
                ticketTypes: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!event) throw new NotFoundException('Event not found');
        return event;
    }

    @Get(':slug')
    detail(@Param('slug') slug: string) {
        return this.eventsService.getPublicBySlug(slug);
    }
}