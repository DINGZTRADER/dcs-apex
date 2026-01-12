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
import { createPayment } from "@/lib/actions/payments"
import { getStudentFeeSummary } from "@/lib/actions/fees"
import { getStudents } from "@/lib/actions/students"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  preSelectedStudentId?: string
}

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CARD", label: "Card" },
]

interface StudentOption {
  id: string
  studentNo: string
  fullName: string
  program: string
}

interface StudentFee {
  id: string
  amountDue: number
  amountPaid: number
  balance: number
  status: string
  feeStructure: {
    name: string
    feeType: string
  }
}

export function PaymentForm({ open, onOpenChange, onSuccess, preSelectedStudentId }: PaymentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [students, setStudents] = useState<StudentOption[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string>(preSelectedStudentId || "")
  const [studentFees, setStudentFees] = useState<StudentFee[]>([])
  const [selectedFee, setSelectedFee] = useState<string>("")
  const [loadingFees, setLoadingFees] = useState(false)

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

  // Load student fees when student is selected
  useEffect(() => {
    if (selectedStudent) {
      setLoadingFees(true)
      getStudentFeeSummary(selectedStudent).then((result) => {
        setStudentFees(result.fees.filter((f) => f.status !== "PAID"))
        setLoadingFees(false)
      })
    } else {
      setStudentFees([])
    }
  }, [selectedStudent])

  const handleSubmit = async (formData: FormData) => {
    if (!selectedStudent) {
      toast.error("Please select a student")
      return
    }

    formData.set("studentId", selectedStudent)
    if (selectedFee) {
      formData.set("studentFeeId", selectedFee)
    }

    startTransition(async () => {
      try {
        const result = await createPayment(formData)
        toast.success(`Payment recorded: ${result.data.paymentNo}`)
        onOpenChange(false)
        setSelectedStudent("")
        setSelectedFee("")
        setStudentFees([])
        onSuccess?.()
      } catch (error: any) {
        toast.error(error.message || "Something went wrong")
      }
    })
  }

  const selectedFeeDetails = studentFees.find((f) => f.id === selectedFee)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a new payment from a student.
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
                  setStudentFees([])
                  setSelectedFee("")
                }}
              >
                Clear selection
              </Button>
            )}
          </div>

          {/* Outstanding Fees */}
          {selectedStudent && (
            <div className="space-y-2">
              <Label>Apply to Fee (Optional)</Label>
              {loadingFees ? (
                <div className="text-sm text-muted-foreground">Loading fees...</div>
              ) : studentFees.length === 0 ? (
                <div className="text-sm text-muted-foreground">No outstanding fees</div>
              ) : (
                <Select value={selectedFee} onValueChange={setSelectedFee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fee to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentFees.map((fee) => (
                      <SelectItem key={fee.id} value={fee.id}>
                        <div className="flex items-center gap-2">
                          <span>{fee.feeStructure.name}</span>
                          <Badge variant="warning" className="text-xs">
                            {formatCurrency(fee.balance)} due
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedFeeDetails && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded-lg">
                  <p>Due: {formatCurrency(selectedFeeDetails.amountDue)}</p>
                  <p>Paid: {formatCurrency(selectedFeeDetails.amountPaid)}</p>
                  <p className="font-semibold">Balance: {formatCurrency(selectedFeeDetails.balance)}</p>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="Enter payment amount"
              defaultValue={selectedFeeDetails?.balance}
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select name="paymentMethod" defaultValue="CASH">
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Reference / Transaction ID</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="e.g., Mobile money code, bank ref"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Additional notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedStudent}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
