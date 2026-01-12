import { z } from 'zod'

// Staff validation schemas
export const staffSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['LECTURER', 'SECURITY', 'CLEANER', 'ADMIN', 'OTHER']),
  department: z.string().optional().nullable(),
  salary: z.number().min(0, 'Salary must be positive'),
  dob: z.string().optional().nullable(),
  startDate: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'EXITED']).default('ACTIVE'),
})

export const staffUpdateSchema = staffSchema.partial()

// Student validation schemas
export const studentSchema = z.object({
  studentNo: z.string().min(1, 'Student number is required'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  program: z.string().min(1, 'Program is required'),
  year: z.number().min(1).max(7),
  status: z.enum(['ACTIVE', 'DEFERRED', 'DROPPED']).default('ACTIVE'),
})

export const studentUpdateSchema = studentSchema.partial()

// Expense validation schemas
export const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(1, 'Amount must be positive'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PAID']).default('PENDING'),
})

export const expenseUpdateSchema = expenseSchema.partial()

// Fee Structure validation schemas
export const feeStructureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  feeType: z.enum(['TUITION', 'ACCOMMODATION', 'LIBRARY', 'LABORATORY', 'REGISTRATION', 'EXAMINATION', 'SCHOOL_TRIP', 'SPORTS', 'MEDICAL', 'OTHER']),
  amount: z.number().min(1, 'Amount must be positive'),
  program: z.string().optional().nullable(),
  year: z.number().optional().nullable(),
  semester: z.enum(['SEMESTER_1', 'SEMESTER_2', 'SEMESTER_3']),
  academicYear: z.string().min(1, 'Academic year is required'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const feeStructureUpdateSchema = feeStructureSchema.partial()

// Student Fee validation schemas
export const studentFeeSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  feeStructureId: z.string().min(1, 'Fee structure is required'),
  amountDue: z.number().min(1, 'Amount due must be positive'),
  dueDate: z.string(),
  academicYear: z.string().min(1, 'Academic year is required'),
  semester: z.enum(['SEMESTER_1', 'SEMESTER_2', 'SEMESTER_3']),
})

// Payment validation schemas
export const paymentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  studentFeeId: z.string().optional().nullable(),
  amount: z.number().min(1, 'Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE', 'CARD']),
  reference: z.string().optional().nullable(),
  receiptNo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const paymentUpdateSchema = paymentSchema.partial()

// Types derived from schemas
export type StaffFormData = z.infer<typeof staffSchema>
export type StudentFormData = z.infer<typeof studentSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
export type FeeStructureFormData = z.infer<typeof feeStructureSchema>
export type StudentFeeFormData = z.infer<typeof studentFeeSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>
