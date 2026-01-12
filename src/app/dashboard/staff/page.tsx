"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Users } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { EmptyState } from "@/components/dashboard/empty-state"
import { StaffForm } from "@/components/dashboard/staff/staff-form"
import { StaffActions } from "@/components/dashboard/staff/staff-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getStaff } from "@/lib/actions/staff"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

interface Staff {
  id: string
  fullName: string
  role: string
  department: string | null
  salary: number
  dob: Date | null
  startDate: Date
  status: string
  createdAt: Date
}

const statusVariants: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  EXITED: "destructive",
}

const roles = ["all", "LECTURER", "SECURITY", "CLEANER", "ADMIN", "OTHER"]
const statuses = ["all", "ACTIVE", "SUSPENDED", "EXITED"]

export default function StaffPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<Staff[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [role, setRole] = useState(searchParams.get("role") || "all")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  
  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getStaff({
        search: debouncedSearch,
        role: role !== "all" ? role : undefined,
        status: status !== "all" ? status : undefined,
        page,
        limit: 10,
      })
      setData(result.data)
      setTotal(result.total)
      setPages(result.pages)
    } catch (error) {
      console.error("Failed to fetch staff:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, role, status, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role !== "all") params.set("role", role)
    if (status !== "all") params.set("status", status)
    if (page > 1) params.set("page", page.toString())
    
    const query = params.toString()
    router.replace(`/dashboard/staff${query ? `?${query}` : ""}`, { scroll: false })
  }, [search, role, status, page, router])

  const columns = [
    {
      key: "fullName",
      header: "Name",
      cell: (item: Staff) => (
        <div>
          <p className="font-medium">{item.fullName}</p>
          <p className="text-xs text-muted-foreground">{item.department || "—"}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (item: Staff) => (
        <Badge variant="secondary">{item.role}</Badge>
      ),
    },
    {
      key: "salary",
      header: "Salary",
      cell: (item: Staff) => formatCurrency(item.salary),
    },
    {
      key: "startDate",
      header: "Start Date",
      cell: (item: Staff) => formatDate(item.startDate),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Staff) => (
        <Badge variant={statusVariants[item.status]}>{item.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (item: Staff) => (
        <StaffActions staff={item} onUpdate={fetchData} />
      ),
      className: "w-12",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        description="Manage your university staff members"
      >
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "all" ? "All Roles" : r}
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
        searchPlaceholder="Search by name or department..."
        onSearch={(v) => { setSearch(v); setPage(1) }}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Users}
            title="No staff members found"
            description={
              search || role !== "all" || status !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first staff member"
            }
            action={
              !search && role === "all" && status === "all"
                ? { label: "Add Staff", onClick: () => setShowForm(true) }
                : undefined
            }
          />
        }
      />

      <StaffForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={fetchData}
      />
    </div>
  )
}
