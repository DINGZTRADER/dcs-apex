import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { fileURLToPath } from 'url'; // New import

const connectionString = process.env.DATABASE_URL as string;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const __filename = fileURLToPath(import.meta.url); // Define __filename
  const __dirname = path.dirname(__filename); // Define __dirname

  const seedDataPath = path.join(process.cwd(), 'seed_data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

  for (const item of seedData) {
    const { model, data } = item;
    switch (model) {
      case 'User':
        await prisma.user.upsert({
          where: { email: data.email },
          update: {},
          create: data,
        });
        break;
      case 'Staff':
        await prisma.staff.create({ data });
        break;
      case 'Student':
        await prisma.student.upsert({
          where: { studentNo: data.studentNo },
          update: {},
          create: data,
        });
        break;
      case 'Expense':
        await prisma.expense.create({ data });
        break;
      default:
        console.warn(`Unknown model: ${model}`);
    }
  }
  console.log('Seed data inserted successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
