
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected!');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Failed:', e);
        process.exit(1);
    }
}

main();
