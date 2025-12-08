import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const prisma = new PrismaClient();

async function main() {
    // Roles
    const roles = ['ADMIN', 'TEACHER', 'STUDENT', 'LEGAL_GUARDIAN'];

    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName, description: `System ${roleName} role` },
        });
    }

    // Admin User
    const adminEmail = 'admin@escuelatecnica.com';
    const adminPassword = 'admin123'; // Change this in production
    const passwordHash = await hashPassword(adminPassword);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash,
            firstName: 'Sistema',
            paternalSurname: 'Administrador',
            maternalSurname: 'Principal',
            isActive: true,
            emailVerified: true,
            userRoles: {
                create: {
                    role: {
                        connect: { name: 'ADMIN' },
                    },
                },
            },
        },
    });

    console.log({ adminUser });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
