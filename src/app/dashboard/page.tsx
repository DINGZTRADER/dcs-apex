"use client"

import { useEffect, useState } from "react"
import { Users, GraduationCap, Wallet, TrendingUp, CreditCard, DollarSign } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { ExpenseBarChart, ExpensePieChart } from "@/components/dashboard/charts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PendingExpenses } from "@/components/dashboard/pending-expenses"
import { getStaffStats } from "@/lib/actions/staff"
import { getStudentStats } from "@/lib/actions/students"
import { getExpenseStats, getPendingExpenses } from "@/lib/actions/expenses"
import { getFinancialPosition } from "@/lib/actions/financial"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  staffStats: { total: number; active: number; byRole: Record<string, number> }
  studentStats: { total: number; active: number; byProgram: Record<string, number>; byYear: Record<number, number> }
  expenseStats: {
    total: number
    pending: number
    approved: number
    paid: number
    totalAmount: number
    byCategory: { category: string; amount: number; count: number }[]
  }
  financialPosition: {
    totalReceivables: number
    totalExpected: number
    totalCollected: number
    totalOutstanding: number
    totalExpenses: number
    netAmount: number
    collectionRate: number
    expenseRatio: number
    paymentCount: number
    expenseCount: number
  }
  pendingExpenses: { id: string; category: string; description: string; amount: number; status: string }[]
  recentActivity: {
    id: string
    type: "staff" | "student" | "expense"
    name: string
    action: string
    status: string
    createdAt: Date
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [staffStats, studentStats, expenseStats, financialPosition, pendingExpenses] = await Promise.all([
          getStaffStats(),
          getStudentStats(),
          getExpenseStats(),
          getFinancialPosition(),
          getPendingExpenses(),
        ])
        
        setData({
          staffStats,
          studentStats,
          expenseStats,
          financialPosition,
          pendingExpenses,
          recentActivity: [], // Simplified - we'll skip recent activity for now
        })
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>Failed to load dashboard data</div>
  }

  const { staffStats, studentStats, expenseStats, financialPosition, pendingExpenses, recentActivity } = data

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your university."
      />

      {/* Financial Position Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Position
          </CardTitle>
          <CardDescription>
            Complete financial overview: Receivables vs Expenses = Net Amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Receivables</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(financialPosition.totalReceivables)}
              </p>
              <p className="text-xs text-muted-foreground">
                {financialPosition.paymentCount} payments collected
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(financialPosition.totalExpenses)}
              </p>
              <p className="text-xs text-muted-foreground">
                {financialPosition.expenseCount} transactions
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Net Amount</p>
              <p className={`text-2xl font-bold ${
                financialPosition.netAmount >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatCurrency(financialPosition.netAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {financialPosition.netAmount >= 0 ? "Surplus" : "Deficit"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold">
                {financialPosition.collectionRate}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(financialPosition.totalOutstanding)} outstanding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={staffStats.total.toLocaleString()}
          description={`${staffStats.active} active`}
          icon={Users}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Total Students"
          value={studentStats.total.toLocaleString()}
          description={`${studentStats.active} enrolled`}
          icon={GraduationCap}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="Total Receivables"
          value={formatCurrency(financialPosition.totalReceivables)}
          description={`${financialPosition.paymentCount} payments`}
          icon={CreditCard}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(expenseStats.totalAmount)}
          description={`${expenseStats.total} transactions`}
          icon={Wallet}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ExpenseBarChart data={expenseStats.byCategory} />
        <ExpensePieChart data={expenseStats.byCategory} />
      </div>

      {/* Activity Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity items={recentActivity} />
        <PendingExpenses expenses={pendingExpenses} />
      </div>
    </div>
  )
}
