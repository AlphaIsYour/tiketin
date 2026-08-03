import 'dotenv/config';
import { PrismaClient } from '@tiketin/db';
import { hashPassword } from '@tiketin/auth';

const prisma = new PrismaClient();

interface SeedAdminArgs {
    email: string;
    password: string;
    fullName: string;
    resetPassword: boolean;
}

function parseArgs(): SeedAdminArgs {
    const args = process.argv.slice(2);
    const flags: Record<string, string> = {};

    for (const arg of args) {
        const match = arg.match(/^--([a-zA-Z]+)=(.*)$/);
        if (match) flags[match[1]] = match[2];
    }

    const email = flags.email ?? process.env.ADMIN_EMAIL;
    const password = flags.password ?? process.env.ADMIN_PASSWORD;
    const fullName = flags.fullName ?? process.env.ADMIN_FULL_NAME ?? 'Platform Admin';
    const resetPassword = flags.resetPassword === 'true' || process.argv.includes('--reset-password');

    if (!email || !password) {
        throw new Error(
            'Missing required admin credentials. Usage:\n' +
            '  pnpm --filter api seed:admin --email=admin@tiketin.id --password=StrongPass123\n' +
            'or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.',
        );
    }

    if (password.length < 8) {
        throw new Error('Admin password must be at least 8 characters.');
    }

    return { email, password, fullName, resetPassword };
}

async function seedAdmin() {
    const { email, password, fullName, resetPassword } = parseArgs();

    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                status: 'ACTIVE',
                platformRole: 'ADMIN',
            },
        });
        console.log(`Created new platform admin: ${user.email} (${user.id})`);
        return;
    }

    const updateData: { platformRole: 'ADMIN'; passwordHash?: string } = { platformRole: 'ADMIN' };

    if (existing.platformRole === 'ADMIN' && !resetPassword) {
        console.log(`User ${email} is already a platform admin. No changes made.`);
        console.log('Pass --reset-password to also update the password.');
        return;
    }

    if (resetPassword) {
        updateData.passwordHash = await hashPassword(password);
    }

    const updated = await prisma.user.update({
        where: { email },
        data: updateData,
    });

    console.log(`Promoted existing user to platform admin: ${updated.email} (${updated.id})`);
    if (resetPassword) {
        console.log('Password was also reset.');
    }
}

seedAdmin()
    .catch((err) => {
        console.error('Failed to seed admin:', err instanceof Error ? err.message : err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });