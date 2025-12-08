import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = `test-teacher-${Date.now()}@example.com`;
    console.log(`Attempting to create user with email: ${email} and connect to TEACHER role...`);

    try {
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash: 'dummyhash',
                firstName: 'Test',
                paternalSurname: 'Teacher',
                isActive: true,
                userRoles: {
                    create: { role: { connect: { name: 'TEACHER' } } }
                }
            }
        });
        console.log('Successfully created user with TEACHER role:', newUser);
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
