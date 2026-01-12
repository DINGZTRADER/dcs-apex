"use server"

import { prisma } from "@/lib/prisma"

/**
 * Get comprehensive financial position for directors
 * Calculates: Total Receivables vs Total Expenses = Net Amount
 */
export async function getFinancialPosition() {
  // Get all payments (receivables/income)
  const [paymentStats, feeStats, expenseStats] = await Promise.all([
    // Total payments collected (actual receivables)
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    // Fee statistics (expected vs collected)
    prisma.studentFee.aggregate({
      _sum: {
        amountDue: true,
        amountPaid: true,
        balance: true,
      },
    }),
    // Total expenses (outflows)
    prisma.expense.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
  ])

  const totalReceivables = paymentStats._sum.amount || 0 // Actual payments collected
  const totalExpected = feeStats._sum.amountDue || 0 // Expected fees
  const totalCollected = feeStats._sum.amountPaid || 0 // Fees collected (same as payments, but from fee perspective)
  const totalOutstanding = feeStats._sum.balance || 0 // Outstanding fees
  const totalExpenses = expenseStats._sum.amount || 0 // Total expenses
  const netAmount = totalReceivables - totalExpenses // Net financial position

  return {
    // Receivables (Money In)
    totalReceivables,
    totalExpected, // Expected from fees
    totalCollected, // Collected from fees
    totalOutstanding, // Still owed
    
    // Expenses (Money Out)
    totalExpenses,
    
    // Net Position
    netAmount, // Receivables - Expenses = Net Amount
    
    // Additional metrics
    collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
    expenseRatio: totalReceivables > 0 ? Math.round((totalExpenses / totalReceivables) * 100) : 0,
    
    // Counts
    paymentCount: paymentStats._count.id || 0,
    expenseCount: expenseStats._count.id || 0,
  }
}
