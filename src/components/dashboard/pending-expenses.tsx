"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  status: string
}

interface PendingExpensesProps {
  expenses: Expense[]
}

export function PendingExpenses({ expenses }: PendingExpensesProps) {
  if (!expenses.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-emerald-500/10 p-3 mb-3">
                <AlertCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-600">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No pending expenses to review
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pending Approvals
            <Badge variant="warning" className="ml-2">
              {expenses.length}
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance?status=PENDING">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {expense.category}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {expense.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
