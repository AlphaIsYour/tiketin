// apps/organizer/src/lib/storefront-types.ts
export interface StorefrontSettings {
    headline: string | null;
    subheadline: string | null;
    accentColor: string;
    themePreset: string;
    coverImageUrl: string | null;
    ctaLabel: string | null;
    ctaUrl: string | null;
    isPublic: boolean;
}

export const THEME_PRESETS = [
    { value: 'default', label: 'Default — Biru Tiketin' },
    { value: 'midnight', label: 'Midnight — Gelap' },
    { value: 'sunrise', label: 'Sunrise — Hangat' },
    { value: 'forest', label: 'Forest — Hijau' },
    { value: 'monochrome', label: 'Monochrome — Netral' },
];