import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const currentYear = new Date().getFullYear();
const academicYear = `${currentYear}/${currentYear + 1}`;

const feeStructures = [
  {
    name: "Tuition Fee - Year 1",
    feeType: "TUITION" as const,
    amount: 2500000,
    year: 1,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "First year tuition fees",
  },
  {
    name: "Tuition Fee - Year 2",
    feeType: "TUITION" as const,
    amount: 2800000,
    year: 2,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Second year tuition fees",
  },
  {
    name: "Tuition Fee - Year 3",
    feeType: "TUITION" as const,
    amount: 3000000,
    year: 3,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Third year tuition fees",
  },
  {
    name: "Accommodation - Hostel",
    feeType: "ACCOMMODATION" as const,
    amount: 800000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "University hostel accommodation per semester",
  },
  {
    name: "Library Fee",
    feeType: "LIBRARY" as const,
    amount: 100000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Annual library access fee",
  },
  {
    name: "Laboratory Fee",
    feeType: "LABORATORY" as const,
    amount: 150000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Science lab usage fee",
  },
  {
    name: "Registration Fee",
    feeType: "REGISTRATION" as const,
    amount: 50000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Semester registration fee",
  },
  {
    name: "Examination Fee",
    feeType: "EXAMINATION" as const,
    amount: 75000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "End of semester examination fee",
  },
  {
    name: "School Trip - Lake Victoria",
    feeType: "SCHOOL_TRIP" as const,
    amount: 200000,
    semester: "SEMESTER_2" as const,
    academicYear,
    description: "Educational trip to Lake Victoria",
  },
  {
    name: "Sports Fee",
    feeType: "SPORTS" as const,
    amount: 50000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Sports and recreation fee",
  },
  {
    name: "Medical Insurance",
    feeType: "MEDICAL" as const,
    amount: 120000,
    semester: "SEMESTER_1" as const,
    academicYear,
    description: "Student medical insurance cover",
  },
];

async function main() {
  console.log("Seeding fee structures...");

  // Create fee structures
  for (const fee of feeStructures) {
    try {
      await prisma.feeStructure.create({
        data: fee,
      });
      console.log(`Created: ${fee.name}`);
    } catch (e: any) {
      if (e.code === 'P2002') {
        console.log(`Already exists: ${fee.name}`);
      } else {
        throw e;
      }
    }
  }

  console.log("\nFee structures seeded!");

  // Get students and fees
  console.log("\nAssigning fees to students...");
  
  const students = await prisma.student.findMany({
    take: 100,
    where: { status: "ACTIVE" },
  });

  const fees = await prisma.feeStructure.findMany();
  const tuitionFees = fees.filter(f => f.feeType === "TUITION");
  
  let assignedCount = 0;
  for (const student of students) {
    const tuitionFee = tuitionFees.find(f => f.year === student.year) || tuitionFees[0];
    if (!tuitionFee) continue;
    
    try {
      await prisma.studentFee.create({
        data: {
          studentId: student.id,
          feeStructureId: tuitionFee.id,
          amountDue: tuitionFee.amount,
          balance: tuitionFee.amount,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          academicYear,
          semester: "SEMESTER_1",
          status: "PENDING",
        },
      });
      assignedCount++;
    } catch (e: any) {
      // Skip if already assigned (unique constraint)
    }
  }

  console.log(`Fees assigned to ${assignedCount} students!`);

  // Create some sample payments
  console.log("\nCreating sample payments...");

  const studentFees = await prisma.studentFee.findMany({
    take: 30,
    where: { status: "PENDING" },
    include: { student: true },
  });

  let paymentCounter = await prisma.payment.count();
  paymentCounter++;

  for (const sf of studentFees) {
    const paymentAmount = Math.floor(sf.amountDue * (0.3 + Math.random() * 0.7));
    const methods = ["CASH", "BANK_TRANSFER", "MOBILE_MONEY"] as const;
    
    try {
      await prisma.payment.create({
        data: {
          paymentNo: `PAY-${currentYear}-${paymentCounter.toString().padStart(5, "0")}`,
          studentId: sf.studentId,
          studentFeeId: sf.id,
          amount: paymentAmount,
          paymentMethod: methods[Math.floor(Math.random() * methods.length)],
          reference: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
        },
      });

      const newAmountPaid = sf.amountPaid + paymentAmount;
      const newBalance = sf.amountDue - newAmountPaid;
      
      await prisma.studentFee.update({
        where: { id: sf.id },
        data: {
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newBalance <= 0 ? "PAID" : "PARTIAL",
        },
      });

      paymentCounter++;
    } catch (e) {
      // Skip errors
    }
  }

  console.log("Sample payments created!");
  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
