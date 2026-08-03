// apps/admin/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#1e99d5', dark: '#11499e' },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;