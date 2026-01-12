"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Wallet, TrendingUp, CheckCircle, Clock, CreditCard } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { EmptyState } from "@/components/dashboard/empty-state"
import { StatCard } from "@/components/dashboard/stat-card"
import { ExpenseForm } from "@/components/dashboard/expenses/expense-form"
import { ExpenseActions } from "@/components/dashboard/expenses/expense-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getExpenses, getExpenseStats } from "@/lib/actions/expenses"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  status: string
  createdAt: Date
}

interface ExpenseStats {
  total: number
  pending: number
  approved: number
  paid: number
  totalAmount: number
}

const statusVariants: Record<string, "success" | "warning" | "info" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "secondary",
  PAID: "info",
}

const categories = [
  "all",
  "Office Supplies",
  "Utilities",
  "Salaries",
  "Maintenance",
  "Travel",
  "Research Grants",
  "Training",
  "Security",
  "Cleaning",
  "Internet Services",
]

const statuses = ["all", "PENDING", "APPROVED", "REJECTED", "PAID"]

export default function FinancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  
  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [result, statsResult] = await Promise.all([
        getExpenses({
          search: debouncedSearch,
          category: category !== "all" ? category : undefined,
          status: status !== "all" ? status : undefined,
          page,
          limit: 10,
        }),
        getExpenseStats(),
      ])
      setData(result.data)
      setTotal(result.total)
      setPages(result.pages)
      setStats(statsResult)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, status, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category !== "all") params.set("category", category)
    if (status !== "all") params.set("status", status)
    if (page > 1) params.set("page", page.toString())
    
    const query = params.toString()
    router.replace(`/dashboard/finance${query ? `?${query}` : ""}`, { scroll: false })
  }, [search, category, status, page, router])

  const columns = [
    {
      key: "category",
      header: "Category",
      cell: (item: Expense) => (
        <Badge variant="secondary">{item.category}</Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (item: Expense) => (
        <p className="max-w-[250px] truncate" title={item.description}>
          {item.description}
        </p>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item: Expense) => (
        <span className="font-semibold">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (item: Expense) => formatDate(item.createdAt),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Expense) => (
        <Badge variant={statusVariants[item.status]}>{item.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (item: Expense) => (
        <ExpenseActions expense={item} onUpdate={fetchData} />
      ),
      className: "w-12",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Management"
        description="Track and manage university expenses"
      >
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalAmount)}
            description={`${stats.total} transactions`}
            icon={Wallet}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            description="Awaiting approval"
            icon={Clock}
            variant="warning"
            delay={0.1}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            description="Ready for payment"
            icon={CheckCircle}
            variant="success"
            delay={0.2}
          />
          <StatCard
            title="Paid"
            value={stats.paid}
            description="Completed payments"
            icon={CreditCard}
            variant="default"
            delay={0.3}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All Statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data}
        columns={columns}
        total={total}
        page={page}
        pages={pages}
        loading={loading}
        searchPlaceholder="Search by description or category..."
        onSearch={(v) => { setSearch(v); setPage(1) }}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Wallet}
            title="No expenses found"
            description={
              search || category !== "all" || status !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first expense"
            }
            action={
              !search && category === "all" && status === "all"
                ? { label: "Add Expense", onClick: () => setShowForm(true) }
                : undefined
            }
          />
        }
      />

      <ExpenseForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={fetchData}
      />
    </div>
  )
}
