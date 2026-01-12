"use client"

import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { assignFeeToStudent, getFeeStructures } from "@/lib/actions/fees"
import { getStudents } from "@/lib/actions/students"
import { formatCurrency } from "@/lib/utils"

interface AssignFeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preSelectedStudentId?: string
}

interface FeeStructure {
  id: string
  name: string
  feeType: string
  amount: number
  academicYear: string
  semester: string
}

interface StudentOption {
  id: string
  studentNo: string
  fullName: string
  program: string
}

const currentYear = new Date().getFullYear()
const academicYears = [
  `${currentYear}/${currentYear + 1}`,
  `${currentYear - 1}/${currentYear}`,
  `${currentYear + 1}/${currentYear + 2}`,
]

const semesters = [
  { value: "SEMESTER_1", label: "Semester 1" },
  { value: "SEMESTER_2", label: "Semester 2" },
  { value: "SEMESTER_3", label: "Semester 3" },
]

export function AssignFeeForm({ open, onOpenChange, onSuccess, preSelectedStudentId }: AssignFeeFormProps) {
  const [isPending, startTransition] = useTransition()
  const [students, setStudents] = useState<StudentOption[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string>(preSelectedStudentId || "")
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [selectedFee, setSelectedFee] = useState<string>("")
  const [customAmount, setCustomAmount] = useState<string>("")

  // Load fee structures
  useEffect(() => {
    getFeeStructures({ isActive: true, limit: 100 }).then((result) => {
      setFeeStructures(result.data)
    })
  }, [])

  // Search students
  useEffect(() => {
    if (studentSearch.length >= 2) {
      getStudents({ search: studentSearch, limit: 10 }).then((result) => {
        setStudents(result.data.map((s) => ({
          id: s.id,
          studentNo: s.studentNo,
          fullName: s.fullName,
          program: s.program,
        })))
      })
    }
  }, [studentSearch])

  // Set amount when fee is selected
  useEffect(() => {
    const fee = feeStructures.find((f) => f.id === selectedFee)
    if (fee) {
      setCustomAmount(fee.amount.toString())
    }
  }, [selectedFee, feeStructures])

  const handleSubmit = async (formData: FormData) => {
    if (!selectedStudent || !selectedFee) {
      toast.error("Please select a student and fee")
      return
    }

    formData.set("studentId", selectedStudent)
    formData.set("feeStructureId", selectedFee)
    formData.set("amountDue", customAmount)

    startTransition(async () => {
      try {
        await assignFeeToStudent(formData)
        toast.success("Fee assigned to student successfully")
        onOpenChange(false)
        setSelectedStudent("")
        setSelectedFee("")
        setCustomAmount("")
        onSuccess?.()
      } catch (error: any) {
        toast.error(error.message || "Something went wrong")
      }
    })
  }

  const selectedFeeDetails = feeStructures.find((f) => f.id === selectedFee)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Fee to Student</DialogTitle>
          <DialogDescription>
            Assign a fee structure to a specific student.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {/* Student Search */}
          <div className="space-y-2">
            <Label>Student</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or student number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {students.length > 0 && !selectedStudent && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudent(student.id)
                      setStudentSearch(`${student.studentNo} - ${student.fullName}`)
                      setStudents([])
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex justify-between items-center"
                  >
                    <span className="font-medium">{student.fullName}</span>
                    <span className="text-muted-foreground">{student.studentNo}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedStudent && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStudent("")
                  setStudentSearch("")
                }}
              >
                Clear selection
              </Button>
            )}
          </div>

          {/* Fee Structure Selection */}
          <div className="space-y-2">
            <Label>Fee Structure</Label>
            <Select value={selectedFee} onValueChange={setSelectedFee}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fee structure" />
              </SelectTrigger>
              <SelectContent>
                {feeStructures.map((fee) => (
                  <SelectItem key={fee.id} value={fee.id}>
                    {fee.name} - {formatCurrency(fee.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFeeDetails && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded-lg">
                <p>Type: {selectedFeeDetails.feeType}</p>
                <p>Academic Year: {selectedFeeDetails.academicYear}</p>
                <p>Semester: {selectedFeeDetails.semester.replace("_", " ")}</p>
              </div>
            )}
          </div>

          {/* Amount (can be customized) */}
          <div className="space-y-2">
            <Label htmlFor="amountDue">Amount Due (UGX)</Label>
            <Input
              id="amountDue"
              name="amountDue"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
            <p className="text-xs text-muted-foreground">
              You can adjust the amount for this specific student if needed.
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select name="academicYear" defaultValue={selectedFeeDetails?.academicYear || academicYears[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select name="semester" defaultValue={selectedFeeDetails?.semester || "SEMESTER_1"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.value} value={sem.value}>
                      {sem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedStudent || !selectedFee}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Fee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
