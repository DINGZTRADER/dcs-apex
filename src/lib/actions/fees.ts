"use server"

import { prisma } from "@/lib/prisma"
import { feeStructureSchema, studentFeeSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

// Fee Structure Actions
export async function getFeeStructures(params?: {
  search?: string
  feeType?: string
  academicYear?: string
  isActive?: boolean
  page?: number
  limit?: number
}) {
  const { search, feeType, academicYear, isActive, page = 1, limit = 10 } = params || {}
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { program: { contains: search, mode: "insensitive" } },
    ]
  }

  if (feeType && feeType !== "all") {
    where.feeType = feeType
  }

  if (academicYear && academicYear !== "all") {
    where.academicYear = academicYear
  }

  if (isActive !== undefined) {
    where.isActive = isActive
  }

  const [fees, total] = await Promise.all([
    prisma.feeStructure.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feeStructure.count({ where }),
  ])

  return {
    data: fees,
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function getFeeStructureById(id: string) {
  return prisma.feeStructure.findUnique({ where: { id } })
}

export async function createFeeStructure(formData: FormData) {
  const programVal = formData.get("program") as string
  const yearVal = formData.get("year") as string
  const raw = {
    name: formData.get("name") as string,
    feeType: formData.get("feeType") as string,
    amount: parseInt(formData.get("amount") as string),
    program: programVal && programVal !== "__all__" ? programVal : null,
    year: yearVal && yearVal !== "__all__" ? parseInt(yearVal) : null,
    semester: formData.get("semester") as string,
    academicYear: formData.get("academicYear") as string,
    description: (formData.get("description") as string) || null,
    isActive: formData.get("isActive") === "true",
  }

  const validated = feeStructureSchema.parse(raw)

  const fee = await prisma.feeStructure.create({
    data: validated,
  })

  revalidatePath("/dashboard/payments")

  return { success: true, data: fee }
}

export async function updateFeeStructure(id: string, formData: FormData) {
  const raw: any = {}

  const name = formData.get("name")
  if (name) raw.name = name as string

  const feeType = formData.get("feeType")
  if (feeType) raw.feeType = feeType as string

  const amount = formData.get("amount")
  if (amount) raw.amount = parseInt(amount as string)

  const program = formData.get("program")
  raw.program = program ? (program as string) : null

  const year = formData.get("year")
  raw.year = year ? parseInt(year as string) : null

  const semester = formData.get("semester")
  if (semester) raw.semester = semester as string

  const academicYear = formData.get("academicYear")
  if (academicYear) raw.academicYear = academicYear as string

  const description = formData.get("description")
  raw.description = description ? (description as string) : null

  const isActive = formData.get("isActive")
  if (isActive !== null) raw.isActive = isActive === "true"

  const fee = await prisma.feeStructure.update({
    where: { id },
    data: raw,
  })

  revalidatePath("/dashboard/payments")

  return { success: true, data: fee }
}

export async function deleteFeeStructure(id: string) {
  await prisma.feeStructure.delete({ where: { id } })

  revalidatePath("/dashboard/payments")

  return { success: true }
}

// Student Fee Actions
export async function getStudentFees(params?: {
  studentId?: string
  status?: string
  academicYear?: string
  page?: number
  limit?: number
}) {
  const { studentId, status, academicYear, page = 1, limit = 10 } = params || {}
  const skip = (page - 1) * limit

  const where: any = {}

  if (studentId) {
    where.studentId = studentId
  }

  if (status && status !== "all") {
    where.status = status
  }

  if (academicYear && academicYear !== "all") {
    where.academicYear = academicYear
  }

  const [fees, total] = await Promise.all([
    prisma.studentFee.findMany({
      where,
      include: {
        student: {
          select: { id: true, studentNo: true, fullName: true, program: true },
        },
        feeStructure: {
          select: { id: true, name: true, feeType: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.studentFee.count({ where }),
  ])

  return {
    data: fees,
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function assignFeeToStudent(formData: FormData) {
  const raw = {
    studentId: formData.get("studentId") as string,
    feeStructureId: formData.get("feeStructureId") as string,
    amountDue: parseInt(formData.get("amountDue") as string),
    dueDate: formData.get("dueDate") as string,
    academicYear: formData.get("academicYear") as string,
    semester: formData.get("semester") as string,
  }

  const validated = studentFeeSchema.parse(raw)

  const studentFee = await prisma.studentFee.create({
    data: {
      ...validated,
      balance: validated.amountDue,
      dueDate: new Date(validated.dueDate),
    },
  })

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard/students")

  return { success: true, data: studentFee }
}

export async function assignFeesToMultipleStudents(
  feeStructureId: string,
  studentIds: string[],
  dueDate: string,
  academicYear: string,
  semester: string
) {
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  })

  if (!feeStructure) {
    throw new Error("Fee structure not found")
  }

  const studentFees = await prisma.studentFee.createMany({
    data: studentIds.map((studentId) => ({
      studentId,
      feeStructureId,
      amountDue: feeStructure.amount,
      balance: feeStructure.amount,
      dueDate: new Date(dueDate),
      academicYear,
      semester: semester as any,
    })),
    skipDuplicates: true,
  })

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard/students")

  return { success: true, count: studentFees.count }
}

export async function getStudentFeeSummary(studentId: string) {
  const fees = await prisma.studentFee.findMany({
    where: { studentId },
    include: {
      feeStructure: {
        select: { name: true, feeType: true },
      },
    },
  })

  const totalDue = fees.reduce((sum, f) => sum + f.amountDue, 0)
  const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0)
  const totalBalance = fees.reduce((sum, f) => sum + f.balance, 0)

  return {
    fees,
    summary: {
      totalDue,
      totalPaid,
      totalBalance,
      feeCount: fees.length,
      paidCount: fees.filter((f) => f.status === "PAID").length,
      pendingCount: fees.filter((f) => f.status === "PENDING").length,
      partialCount: fees.filter((f) => f.status === "PARTIAL").length,
    },
  }
}

export async function getFeeStats() {
  const currentYear = new Date().getFullYear()
  const academicYear = `${currentYear}/${currentYear + 1}`

  const [totalExpected, totalCollected, byStatus, byFeeType] = await Promise.all([
    prisma.studentFee.aggregate({
      _sum: { amountDue: true },
    }),
    prisma.studentFee.aggregate({
      _sum: { amountPaid: true },
    }),
    prisma.studentFee.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { amountDue: true, amountPaid: true, balance: true },
    }),
    prisma.studentFee.findMany({
      include: {
        feeStructure: {
          select: { feeType: true },
        },
      },
    }),
  ])

  // Aggregate by fee type
  const feeTypeStats = byFeeType.reduce((acc, fee) => {
    const type = fee.feeStructure.feeType
    if (!acc[type]) {
      acc[type] = { amountDue: 0, amountPaid: 0, balance: 0, count: 0 }
    }
    acc[type].amountDue += fee.amountDue
    acc[type].amountPaid += fee.amountPaid
    acc[type].balance += fee.balance
    acc[type].count += 1
    return acc
  }, {} as Record<string, { amountDue: number; amountPaid: number; balance: number; count: number }>)

  return {
    totalExpected: totalExpected._sum.amountDue || 0,
    totalCollected: totalCollected._sum.amountPaid || 0,
    totalOutstanding: (totalExpected._sum.amountDue || 0) - (totalCollected._sum.amountPaid || 0),
    collectionRate:
      totalExpected._sum.amountDue
        ? Math.round(((totalCollected._sum.amountPaid || 0) / totalExpected._sum.amountDue) * 100)
        : 0,
    byStatus: byStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
      amountDue: item._sum.amountDue || 0,
      amountPaid: item._sum.amountPaid || 0,
      balance: item._sum.balance || 0,
    })),
    byFeeType: Object.entries(feeTypeStats).map(([type, stats]) => ({
      feeType: type,
      ...stats,
    })),
  }
}

export async function getAcademicYears() {
  const years = await prisma.feeStructure.groupBy({
    by: ["academicYear"],
    orderBy: { academicYear: "desc" },
  })
  return years.map((y) => y.academicYear)
}
