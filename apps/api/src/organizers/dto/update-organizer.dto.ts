// apps/api/src/organizers/dto/update-organizer.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizerDto } from './create-organizer.dto';

export class UpdateOrganizerDto extends PartialType(CreateOrganizerDto) { }