"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
  FileText,
  Receipt,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { EmptyState } from "@/components/dashboard/empty-state"
import { StatCard } from "@/components/dashboard/stat-card"
import { PaymentForm } from "@/components/dashboard/payments/payment-form"
import { FeeForm } from "@/components/dashboard/payments/fee-form"
import { AssignFeeForm } from "@/components/dashboard/payments/assign-fee-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPayments, getPaymentStats, deletePayment } from "@/lib/actions/payments"
import { getFeeStructures, getFeeStats, getStudentFees } from "@/lib/actions/fees"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

// Tab component since we don't have it yet
function SimpleTabs({ 
  value, 
  onValueChange, 
  children 
}: { 
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode 
}) {
  return <div>{children}</div>
}

const paymentMethods = ["all", "CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHEQUE", "CARD"]
const paymentStatuses = ["all", "PENDING", "PARTIAL", "PAID", "OVERDUE"]

interface Payment {
  id: string
  paymentNo: string
  amount: number
  paymentMethod: string
  reference: string | null
  paidAt: Date
  student: {
    id: string
    studentNo: string
    fullName: string
    program: string
  }
  studentFee: {
    feeStructure: {
      name: string
      feeType: string
    }
  } | null
}

interface FeeStats {
  totalExpected: number
  totalCollected: number
  totalOutstanding: number
  collectionRate: number
}

export default function PaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState("payments")
  const [payments, setPayments] = useState<Payment[]>([])
  const [feeStats, setFeeStats] = useState<FeeStats | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [showAssignFeeForm, setShowAssignFeeForm] = useState(false)

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [paymentMethod, setPaymentMethod] = useState(searchParams.get("method") || "all")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))

  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [paymentsResult, statsResult] = await Promise.all([
        getPayments({
          search: debouncedSearch,
          paymentMethod: paymentMethod !== "all" ? paymentMethod : undefined,
          page,
          limit: 10,
        }),
        getFeeStats(),
      ])
      setPayments(paymentsResult.data)
      setTotal(paymentsResult.total)
      setPages(paymentsResult.pages)
      setFeeStats(statsResult)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, paymentMethod, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment? This will reverse the payment from the student's fee balance.")) {
      return
    }
    try {
      await deletePayment(id)
      toast.success("Payment deleted successfully")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment")
    }
  }

  const paymentColumns = [
    {
      key: "paymentNo",
      header: "Payment #",
      cell: (item: Payment) => (
        <span className="font-mono text-sm font-medium">{item.paymentNo}</span>
      ),
    },
    {
      key: "student",
      header: "Student",
      cell: (item: Payment) => (
        <div>
          <p className="font-medium">{item.student.fullName}</p>
          <p className="text-xs text-muted-foreground">{item.student.studentNo}</p>
        </div>
      ),
    },
    {
      key: "fee",
      header: "Fee Type",
      cell: (item: Payment) => (
        item.studentFee ? (
          <Badge variant="secondary">{item.studentFee.feeStructure.feeType}</Badge>
        ) : (
          <span className="text-muted-foreground">General</span>
        )
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item: Payment) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      cell: (item: Payment) => (
        <Badge variant="outline">{item.paymentMethod.replace("_", " ")}</Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (item: Payment) => formatDateTime(item.paidAt),
    },
    {
      key: "actions",
      header: "",
      cell: (item: Payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleDeletePayment(item.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Fees"
        description="Manage student fees and track payments"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFeeForm(true)}>
            <FileText className="mr-2 h-4 w-4" />
            New Fee Structure
          </Button>
          <Button variant="outline" onClick={() => setShowAssignFeeForm(true)}>
            <Receipt className="mr-2 h-4 w-4" />
            Assign Fee
          </Button>
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      {feeStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Expected"
            value={formatCurrency(feeStats.totalExpected)}
            description="All assigned fees"
            icon={Wallet}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Total Collected"
            value={formatCurrency(feeStats.totalCollected)}
            description="Payments received"
            icon={CreditCard}
            variant="success"
            delay={0.1}
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(feeStats.totalOutstanding)}
            description="Pending collection"
            icon={AlertCircle}
            variant="warning"
            delay={0.2}
          />
          <StatCard
            title="Collection Rate"
            value={`${feeStats.collectionRate}%`}
            description="Of total expected"
            icon={TrendingUp}
            variant="default"
            delay={0.3}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method} value={method}>
                {method === "all" ? "All Methods" : method.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={payments}
            columns={paymentColumns}
            total={total}
            page={page}
            pages={pages}
            loading={loading}
            searchPlaceholder="Search by payment #, student name, or reference..."
            onSearch={(v) => { setSearch(v); setPage(1) }}
            onPageChange={setPage}
            emptyState={
              <EmptyState
                icon={CreditCard}
                title="No payments found"
                description={
                  search || paymentMethod !== "all"
                    ? "Try adjusting your search or filters"
                    : "Record your first payment to get started"
                }
                action={
                  !search && paymentMethod === "all"
                    ? { label: "Record Payment", onClick: () => setShowPaymentForm(true) }
                    : undefined
                }
              />
            }
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <PaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        onSuccess={fetchData}
      />
      <FeeForm
        open={showFeeForm}
        onOpenChange={setShowFeeForm}
        onSuccess={fetchData}
      />
      <AssignFeeForm
        open={showAssignFeeForm}
        onOpenChange={setShowAssignFeeForm}
        onSuccess={fetchData}
      />
    </div>
  )
}
