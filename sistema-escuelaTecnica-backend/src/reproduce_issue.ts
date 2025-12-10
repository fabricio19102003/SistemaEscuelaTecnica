
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    const data: Prisma.GradeUpdateInput = {
        progressTest: 10,
        classPerformance: 10,
    };
}
