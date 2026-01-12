"use server"

import { prisma } from "@/lib/prisma"
import { staffSchema, staffUpdateSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"

export async function getStaff(params?: {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}) {
  const { search, role, status, page = 1, limit = 10 } = params || {}
  const skip = (page - 1) * limit

  const where: any = {}

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { department: { contains: search, mode: "insensitive" } },
    ]
  }

  if (role && role !== "all") {
    where.role = role
  }

  if (status && status !== "all") {
    where.status = status
  }

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.staff.count({ where }),
  ])

  return {
    data: staff,
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function getStaffById(id: string) {
  return prisma.staff.findUnique({ where: { id } })
}

export async function createStaff(formData: FormData) {
  await requireAuth()
  const raw = {
    fullName: formData.get("fullName") as string,
    role: formData.get("role") as string,
    department: formData.get("department") as string || null,
    salary: parseInt(formData.get("salary") as string),
    dob: formData.get("dob") as string || null,
    startDate: formData.get("startDate") as string,
    status: (formData.get("status") as string) || "ACTIVE",
  }

  const validated = staffSchema.parse(raw)

  const staff = await prisma.staff.create({
    data: {
      ...validated,
      dob: validated.dob ? new Date(validated.dob) : null,
      startDate: new Date(validated.startDate),
    },
  })

  revalidatePath("/dashboard/staff")
  revalidatePath("/dashboard")

  return { success: true, data: staff }
}

export async function updateStaff(id: string, formData: FormData) {
  await requireAuth()
  const raw: any = {}

  const fullName = formData.get("fullName")
  if (fullName) raw.fullName = fullName as string

  const role = formData.get("role")
  if (role) raw.role = role as string

  const department = formData.get("department")
  if (department !== null) raw.department = department as string || null

  const salary = formData.get("salary")
  if (salary) raw.salary = parseInt(salary as string)

  const dob = formData.get("dob")
  if (dob !== null) raw.dob = dob as string || null

  const startDate = formData.get("startDate")
  if (startDate) raw.startDate = startDate as string

  const status = formData.get("status")
  if (status) raw.status = status as string

  const validated = staffUpdateSchema.parse(raw)

  const data: any = { ...validated }
  if (validated.dob) data.dob = new Date(validated.dob)
  if (validated.startDate) data.startDate = new Date(validated.startDate)

  const staff = await prisma.staff.update({
    where: { id },
    data,
  })

  revalidatePath("/dashboard/staff")
  revalidatePath("/dashboard")

  return { success: true, data: staff }
}

export async function deleteStaff(id: string) {
  await requireAuth()
  await prisma.staff.delete({ where: { id } })

  revalidatePath("/dashboard/staff")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getStaffStats() {
  const [total, active, byRole] = await Promise.all([
    prisma.staff.count(),
    prisma.staff.count({ where: { status: "ACTIVE" } }),
    prisma.staff.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
  ])

  console.log(`[DEBUG] Staff Stats - Total: ${total}, Active: ${active}`);
  console.log(`[DEBUG] Staff by Role:`, JSON.stringify(byRole));

  return {
    total,
    active,
    byRole: byRole.reduce((acc, item) => {
      acc[item.role] = item._count.role
      return acc
    }, {} as Record<string, number>),
  }
}
