"use server"

import { prisma } from "@/lib/prisma"
import { studentSchema, studentUpdateSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getStudents(params?: {
  search?: string
  program?: string
  status?: string
  year?: number
  page?: number
  limit?: number
}) {
  const { search, program, status, year, page = 1, limit = 10 } = params || {}
  const skip = (page - 1) * limit

  const where: any = {}
  
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { studentNo: { contains: search, mode: "insensitive" } },
    ]
  }
  
  if (program && program !== "all") {
    where.program = program
  }
  
  if (status && status !== "all") {
    where.status = status
  }

  if (year && year > 0) {
    where.year = year
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.student.count({ where }),
  ])

  return {
    data: students,
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({ where: { id } })
}

export async function createStudent(formData: FormData) {
  const raw = {
    studentNo: formData.get("studentNo") as string,
    fullName: formData.get("fullName") as string,
    program: formData.get("program") as string,
    year: parseInt(formData.get("year") as string),
    status: (formData.get("status") as string) || "ACTIVE",
  }

  const validated = studentSchema.parse(raw)

  const student = await prisma.student.create({
    data: validated,
  })

  revalidatePath("/dashboard/students")
  revalidatePath("/dashboard")
  
  return { success: true, data: student }
}

export async function updateStudent(id: string, formData: FormData) {
  const raw: any = {}
  
  const studentNo = formData.get("studentNo")
  if (studentNo) raw.studentNo = studentNo as string
  
  const fullName = formData.get("fullName")
  if (fullName) raw.fullName = fullName as string
  
  const program = formData.get("program")
  if (program) raw.program = program as string
  
  const year = formData.get("year")
  if (year) raw.year = parseInt(year as string)
  
  const status = formData.get("status")
  if (status) raw.status = status as string

  const validated = studentUpdateSchema.parse(raw)

  const student = await prisma.student.update({
    where: { id },
    data: validated,
  })

  revalidatePath("/dashboard/students")
  revalidatePath("/dashboard")
  
  return { success: true, data: student }
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({ where: { id } })
  
  revalidatePath("/dashboard/students")
  revalidatePath("/dashboard")
  
  return { success: true }
}

export async function getStudentStats() {
  const [total, active, byProgram, byYear] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.student.groupBy({
      by: ["program"],
      _count: { program: true },
    }),
    prisma.student.groupBy({
      by: ["year"],
      _count: { year: true },
    }),
  ])

  return {
    total,
    active,
    byProgram: byProgram.reduce((acc, item) => {
      acc[item.program] = item._count.program
      return acc
    }, {} as Record<string, number>),
    byYear: byYear.reduce((acc, item) => {
      acc[item.year] = item._count.year
      return acc
    }, {} as Record<number, number>),
  }
}

export async function getPrograms() {
  const programs = await prisma.student.groupBy({
    by: ["program"],
  })
  return programs.map((p) => p.program)
}
