// apps/api/src/me/dto/update-profile.dto.ts
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    fullName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}