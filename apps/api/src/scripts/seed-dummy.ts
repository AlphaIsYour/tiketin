// apps/api/src/scripts/seed-dummy.ts
import 'dotenv/config';
import { PrismaClient } from '@tiketin/db';
import { hashPassword } from '@tiketin/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dummy data for Tiketin...');
    const defaultPasswordHash = await hashPassword('ChangeMe123!');

    // 1. Seed Super Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tiketin.id' },
        update: { platformRole: 'ADMIN', passwordHash: defaultPasswordHash },
        create: {
            email: 'admin@tiketin.id',
            passwordHash: defaultPasswordHash,
            fullName: 'Platform Super Admin',
            platformRole: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log('✔ Super Admin created:', admin.email);

    // 2. Seed Buyer Account
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@tiketin.id' },
        update: { passwordHash: defaultPasswordHash },
        create: {
            email: 'buyer@tiketin.id',
            passwordHash: defaultPasswordHash,
            fullName: 'Budi Pembeli',
            platformRole: 'USER',
            status: 'ACTIVE',
        },
    });
    console.log('✔ Buyer Account created:', buyer.email);

    // 3. Seed Organizer User Account
    const organizerUser = await prisma.user.upsert({
        where: { email: 'organizer@tiketin.id' },
        update: { passwordHash: defaultPasswordHash },
        create: {
            email: 'organizer@tiketin.id',
            passwordHash: defaultPasswordHash,
            fullName: 'Sound Rhythm Promotor',
            platformRole: 'USER',
            status: 'ACTIVE',
        },
    });
    console.log('✔ Organizer User created:', organizerUser.email);

    // 4. Seed Organizer Organization & Storefront
    let organizer = await prisma.organizer.findFirst({ where: { slug: 'soundrhythm' } });
    if (!organizer) {
        organizer = await prisma.organizer.create({
            data: {
                ownerUserId: organizerUser.id,
                name: 'Sound Rhythm Indonesia',
                slug: 'soundrhythm',
                description: 'Promotor musik dan hiburan terkemuka di Indonesia.',
                status: 'ACTIVE',
                verificationStatus: 'VERIFIED',
                logoUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
            },
        });
    }

    // Connect Organizer Member
    const existingMember = await prisma.organizerMember.findFirst({
        where: { organizerId: organizer.id, userId: organizerUser.id },
    });
    if (!existingMember) {
        await prisma.organizerMember.create({
            data: {
                organizerId: organizer.id,
                userId: organizerUser.id,
                role: 'OWNER',
                status: 'ACTIVE',
            },
        });
    }

    // Create/Update Storefront
    await prisma.organizerStorefront.upsert({
        where: { organizerId: organizer.id },
        update: {
            headline: 'Sound Rhythm Official Ticket Store',
            subheadline: 'Dapatkan tiket konser musik resmi internasional & lokal terbaik.',
            accentColor: '#6366f1',
            themePreset: 'dark',
            isPublic: true,
        },
        create: {
            organizerId: organizer.id,
            headline: 'Sound Rhythm Official Ticket Store',
            subheadline: 'Dapatkan tiket konser musik resmi internasional & lokal terbaik.',
            accentColor: '#6366f1',
            themePreset: 'dark',
            isPublic: true,
        },
    });
    console.log('✔ Organizer Storefront created: /o/soundrhythm');

    // 5. Seed Published Event & Ticket Types
    let event = await prisma.event.findFirst({ where: { slug: 'sound-rhythm-live-2026' } });
    if (!event) {
        event = await prisma.event.create({
            data: {
                organizerId: organizer.id,
                createdByUserId: organizerUser.id,
                title: 'Sound Rhythm Live Music Festival 2026',
                slug: 'sound-rhythm-live-2026',
                shortDescription: 'Konser musik spektakuler tahunan menghadirkan deretan musisi papan atas.',
                fullDescription: 'Nikmati pengalaman konser kelas dunia di Gelora Bung Karno dengan tata lampu dan audio spektakuler.',
                bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop',
                venueName: 'Gelora Bung Karno Main Stadium',
                venueAddress: 'Jl. Pintu Satu Senayan, Jakarta Pusat',
                city: 'Jakarta',
                isOnline: false,
                status: 'PUBLISHED',
                eventStartAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                eventEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
                ticketTypes: {
                    create: [
                        {
                            name: 'VIP Category 1',
                            description: 'Tempat duduk terdepan dengan fasilitas free drink & merchandise exclusive.',
                            price: 1500000,
                            stockTotal: 100,
                            stockSold: 12,
                            isActive: true,
                        },
                        {
                            name: 'Festival Standing',
                            description: 'Area berdiri depan panggung dengan pengalaman audio maksimal.',
                            price: 500000,
                            stockTotal: 500,
                            stockSold: 45,
                            isActive: true,
                        },
                    ],
                },
            },
        });
        console.log('✔ Dummy Event created: /events/sound-rhythm-live-2026');
    }

    console.log('\n========================================');
    console.log('SUCCESS: Seed Dummy Data Completed!');
    console.log('========================================');
    console.log('Dummy Credentials:');
    console.log('1. Super Admin  -> Email: admin@tiketin.id     | Password: ChangeMe123!');
    console.log('2. Organizer    -> Email: organizer@tiketin.id | Password: ChangeMe123!');
    console.log('3. Buyer        -> Email: buyer@tiketin.id     | Password: ChangeMe123!');
    console.log('========================================\n');
}

main()
    .catch((err) => {
        console.error('Failed to seed dummy data:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
