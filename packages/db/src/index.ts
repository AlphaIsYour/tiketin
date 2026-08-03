// packages/db/src/index.ts
import { PrismaClient } from '@prisma/client';

declare global {
    var __prisma__: PrismaClient | undefined;
}

export const prisma = global.__prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    global.__prisma__ = prisma;
}

export * from '@prisma/client';