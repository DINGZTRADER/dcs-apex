"use server"

import { prisma } from "@/lib/prisma"
import { expenseSchema, expenseUpdateSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"

export async function getExpenses(params?: {
  search?: string
  category?: string
  status?: string
  page?: number
  limit?: number
}) {
  const { search, category, status, page = 1, limit = 10 } = params || {}
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ]
  }

  if (category && category !== "all") {
    where.category = category
  }

  if (status && status !== "all") {
    where.status = status
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ])

  return {
    data: expenses,
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function getExpenseById(id: string) {
  return prisma.expense.findUnique({ where: { id } })
}

export async function createExpense(formData: FormData) {
  await requireAuth()
  const raw = {
    category: formData.get("category") as string,
    description: formData.get("description") as string,
    amount: parseInt(formData.get("amount") as string),
    status: (formData.get("status") as string) || "PENDING",
  }

  const validated = expenseSchema.parse(raw)

  const expense = await prisma.expense.create({
    data: validated,
  })

  revalidatePath("/dashboard/finance")
  revalidatePath("/dashboard")

  return { success: true, data: expense }
}

export async function updateExpense(id: string, formData: FormData) {
  await requireAuth()
  const raw: any = {}

  const category = formData.get("category")
  if (category) raw.category = category as string

  const description = formData.get("description")
  if (description) raw.description = description as string

  const amount = formData.get("amount")
  if (amount) raw.amount = parseInt(amount as string)

  const status = formData.get("status")
  if (status) raw.status = status as string

  const validated = expenseUpdateSchema.parse(raw)

  const expense = await prisma.expense.update({
    where: { id },
    data: validated,
  })

  revalidatePath("/dashboard/finance")
  revalidatePath("/dashboard")

  return { success: true, data: expense }
}

export async function deleteExpense(id: string) {
  await requireAuth()
  await prisma.expense.delete({ where: { id } })

  revalidatePath("/dashboard/finance")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getExpenseStats() {
  const [total, pending, approved, paid, byCategory, totalAmount] = await Promise.all([
    prisma.expense.count(),
    prisma.expense.count({ where: { status: "PENDING" } }),
    prisma.expense.count({ where: { status: "APPROVED" } }),
    prisma.expense.count({ where: { status: "PAID" } }),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      _count: { category: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
    }),
  ])

  return {
    total,
    pending,
    approved,
    paid,
    totalAmount: totalAmount._sum.amount || 0,
    byCategory: byCategory.map((item) => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count.category,
    })),
  }
}

export async function getPendingExpenses(limit = 5) {
  return prisma.expense.findMany({
    where: { status: "PENDING" },
    orderBy: { amount: "desc" },
    take: limit,
  })
}

export async function getCategories() {
  const categories = await prisma.expense.groupBy({
    by: ["category"],
  })
  return categories.map((c) => c.category)
}
