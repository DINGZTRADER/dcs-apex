"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, GraduationCap } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { EmptyState } from "@/components/dashboard/empty-state"
import { StudentForm } from "@/components/dashboard/students/student-form"
import { StudentActions } from "@/components/dashboard/students/student-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getStudents } from "@/lib/actions/students"
import { useDebounce } from "@/hooks/use-debounce"

interface Student {
  id: string
  studentNo: string
  fullName: string
  program: string
  year: number
  status: string
  createdAt: Date
}

const statusVariants: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  DEFERRED: "warning",
  DROPPED: "destructive",
}

const statuses = ["all", "ACTIVE", "DEFERRED", "DROPPED"]
const years = ["all", "1", "2", "3", "4", "5", "6", "7"]

export default function StudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [year, setYear] = useState(searchParams.get("year") || "all")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  
  const debouncedSearch = useDebounce(search, 300)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getStudents({
        search: debouncedSearch,
        status: status !== "all" ? status : undefined,
        year: year !== "all" ? parseInt(year) : undefined,
        page,
        limit: 10,
      })
      setData(result.data)
      setTotal(result.total)
      setPages(result.pages)
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, year, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (status !== "all") params.set("status", status)
    if (year !== "all") params.set("year", year)
    if (page > 1) params.set("page", page.toString())
    
    const query = params.toString()
    router.replace(`/dashboard/students${query ? `?${query}` : ""}`, { scroll: false })
  }, [search, status, year, page, router])

  const columns = [
    {
      key: "studentNo",
      header: "Student No.",
      cell: (item: Student) => (
        <span className="font-mono text-sm">{item.studentNo}</span>
      ),
    },
    {
      key: "fullName",
      header: "Name",
      cell: (item: Student) => (
        <p className="font-medium">{item.fullName}</p>
      ),
    },
    {
      key: "program",
      header: "Program",
      cell: (item: Student) => (
        <p className="text-sm max-w-[200px] truncate" title={item.program}>
          {item.program}
        </p>
      ),
    },
    {
      key: "year",
      header: "Year",
      cell: (item: Student) => (
        <Badge variant="secondary">Year {item.year}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Student) => (
        <Badge variant={statusVariants[item.status]}>{item.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (item: Student) => (
        <StudentActions student={item} onUpdate={fetchData} />
      ),
      className: "w-12",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Manage enrolled students and their records"
      >
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={year} onValueChange={(v) => { setYear(v); setPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y === "all" ? "All Years" : `Year ${y}`}
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
        searchPlaceholder="Search by name or student number..."
        onSearch={(v) => { setSearch(v); setPage(1) }}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description={
              search || status !== "all" || year !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by enrolling your first student"
            }
            action={
              !search && status === "all" && year === "all"
                ? { label: "Add Student", onClick: () => setShowForm(true) }
                : undefined
            }
          />
        }
      />

      <StudentForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={fetchData}
      />
    </div>
  )
}
