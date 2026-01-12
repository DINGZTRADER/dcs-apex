"use server"

import { prisma } from "@/lib/prisma"
import { paymentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

// Generate unique payment number
async function generatePaymentNo(): Promise<string> {
  const year = new Date().getFullYear()
  const lastPayment = await prisma.payment.findFirst({
    where: {
      paymentNo: {
        startsWith: `PAY-${year}-`,
      },
    },
    orderBy: { paymentNo: "desc" },
  })

  let nextNum = 1
  if (lastPayment) {
    const lastNum = parseInt(lastPayment.paymentNo.split("-")[2])
    nextNum = lastNum + 1
  }

  return `PAY-${year}-${nextNum.toString().padStart(5, "0")}`
}

export async function getPayments(params?: {
  search?: string
  studentId?: string
  paymentMethod?: string
  page?: number
  limit?: number
}) {
  const { search, studentId, paymentMethod, page = 1, limit = 10 } = params || {}
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { paymentNo: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
      { student: { fullName: { contains: search, mode: "insensitive" } } },
      { student: { studentNo: { contains: search, mode: "insensitive" } } },
    ]
  }

  if (studentId) {
    where.studentId = studentId
  }

  if (paymentMethod && paymentMethod !== "all") {
    where.paymentMethod = paymentMethod
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        student: {
          select: { id: true, studentNo: true, fullName: true, program: true },
        },
        studentFee: {
          include: {
            feeStructure: {
              select: { name: true, feeType: true },
            },
          },
        },
      },
      orderBy: { paidAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ])

  return {
    data: payments,
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      student: true,
      studentFee: {
        include: { feeStructure: true },
      },
    },
  })
}

export async function createPayment(formData: FormData) {
  const raw = {
    studentId: formData.get("studentId") as string,
    studentFeeId: (formData.get("studentFeeId") as string) || null,
    amount: parseInt(formData.get("amount") as string),
    paymentMethod: formData.get("paymentMethod") as string,
    reference: (formData.get("reference") as string) || null,
    receiptNo: (formData.get("receiptNo") as string) || null,
    notes: (formData.get("notes") as string) || null,
  }

  const validated = paymentSchema.parse(raw)
  const paymentNo = await generatePaymentNo()

  const payment = await prisma.payment.create({
    data: {
      ...validated,
      paymentNo,
    },
  })

  // If payment is linked to a student fee, update the fee balance
  if (validated.studentFeeId) {
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: validated.studentFeeId },
    })

    if (studentFee) {
      // Validate payment doesn't exceed balance (with small tolerance for rounding)
      const remainingBalance = studentFee.balance
      if (validated.amount > remainingBalance + 100) { // Allow 100 UGX tolerance for rounding
        throw new Error(
          `Payment amount (${validated.amount}) exceeds remaining balance (${remainingBalance}). Maximum allowed: ${remainingBalance}`
        )
      }

      const newAmountPaid = studentFee.amountPaid + validated.amount
      const newBalance = Math.max(0, studentFee.amountDue - newAmountPaid) // Prevent negative balance
      let newStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED" = "PENDING"

      if (newBalance <= 0) {
        newStatus = "PAID"
      } else if (newAmountPaid > 0) {
        newStatus = "PARTIAL"
      }

      await prisma.studentFee.update({
        where: { id: validated.studentFeeId },
        data: {
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newStatus,
        },
      })
    }
  }

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard/students")
  revalidatePath("/dashboard")

  return { success: true, data: payment }
}

export async function deletePayment(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { studentFee: true },
  })

  if (!payment) {
    throw new Error("Payment not found")
  }

  // Reverse the payment from student fee if linked
  if (payment.studentFeeId && payment.studentFee) {
    const newAmountPaid = payment.studentFee.amountPaid - payment.amount
    const newBalance = payment.studentFee.amountDue - newAmountPaid
    let newStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED" = "PENDING"

    if (newAmountPaid > 0 && newBalance > 0) {
      newStatus = "PARTIAL"
    }

    await prisma.studentFee.update({
      where: { id: payment.studentFeeId },
      data: {
        amountPaid: Math.max(0, newAmountPaid),
        balance: newBalance,
        status: newStatus,
      },
    })
  }

  await prisma.payment.delete({ where: { id } })

  revalidatePath("/dashboard/payments")
  revalidatePath("/dashboard/students")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getPaymentStats() {
  const currentYear = new Date().getFullYear()
  const academicYear = `${currentYear}/${currentYear + 1}`

  const [totalPayments, totalAmount, byMethod, recentPayments] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ["paymentMethod"],
      _sum: { amount: true },
      _count: { paymentMethod: true },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { paidAt: "desc" },
      include: {
        student: {
          select: { studentNo: true, fullName: true },
        },
      },
    }),
  ])

  return {
    totalPayments,
    totalAmount: totalAmount._sum.amount || 0,
    byMethod: byMethod.map((item) => ({
      method: item.paymentMethod,
      amount: item._sum.amount || 0,
      count: item._count.paymentMethod,
    })),
    recentPayments,
  }
}

export async function getStudentPayments(studentId: string) {
  return prisma.payment.findMany({
    where: { studentId },
    include: {
      studentFee: {
        include: {
          feeStructure: {
            select: { name: true, feeType: true },
          },
        },
      },
    },
    orderBy: { paidAt: "desc" },
  })
}
