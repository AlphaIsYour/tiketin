// apps/api/src/checkin/dto/checkin.dto.ts
import { IsString } from 'class-validator';

export class CheckInDto {
    @IsString()
    qrToken: string;
}

export class ManualCheckInDto {
    @IsString()
    ticketCode: string;
}