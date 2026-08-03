// apps/api/src/storefront/dto/update-storefront.dto.ts
import { IsBoolean, IsIn, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
export const THEME_PRESETS = ['default', 'midnight', 'sunrise', 'forest', 'monochrome'] as const;

export class UpdateStorefrontDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    headline?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    subheadline?: string;

    @IsOptional()
    @Matches(HEX_COLOR_REGEX, { message: 'accentColor must be a valid hex color, e.g. #1E99D5' })
    accentColor?: string;

    @IsOptional()
    @IsIn(THEME_PRESETS)
    themePreset?: string;

    @IsOptional()
    @IsUrl()
    coverImageUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    ctaLabel?: string;

    @IsOptional()
    @IsUrl()
    ctaUrl?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}