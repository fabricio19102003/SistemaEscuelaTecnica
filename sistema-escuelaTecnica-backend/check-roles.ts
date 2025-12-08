import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.role.findMany();
    console.log('Roles in DB:', roles);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
