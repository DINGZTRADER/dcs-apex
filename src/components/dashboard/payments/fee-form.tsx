"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
import { createFeeStructure, updateFeeStructure } from "@/lib/actions/fees"

interface FeeStructure {
  id: string
  name: string
  feeType: string
  amount: number
  program: string | null
  year: number | null
  semester: string
  academicYear: string
  description: string | null
  isActive: boolean
}

interface FeeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fee?: FeeStructure | null
  onSuccess?: () => void
}

const feeTypes = [
  { value: "TUITION", label: "Tuition" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "LIBRARY", label: "Library" },
  { value: "LABORATORY", label: "Laboratory" },
  { value: "REGISTRATION", label: "Registration" },
  { value: "EXAMINATION", label: "Examination" },
  { value: "SCHOOL_TRIP", label: "School Trip" },
  { value: "SPORTS", label: "Sports" },
  { value: "MEDICAL", label: "Medical" },
  { value: "OTHER", label: "Other" },
]

const semesters = [
  { value: "SEMESTER_1", label: "Semester 1" },
  { value: "SEMESTER_2", label: "Semester 2" },
  { value: "SEMESTER_3", label: "Semester 3" },
]

const programs = [
  "Bachelor of Science in Computer Science",
  "Bachelor of Arts in Education",
  "Bachelor of Medicine and Surgery",
  "Bachelor of Business Administration",
  "Bachelor of Laws",
  "Bachelor of Engineering (Civil)",
  "Bachelor of Agricultural Economics",
  "Bachelor of Environmental Health",
  "Bachelor of Nursing Science",
  "Diploma in Information Technology",
]

const currentYear = new Date().getFullYear()
const academicYears = [
  `${currentYear}/${currentYear + 1}`,
  `${currentYear - 1}/${currentYear}`,
  `${currentYear + 1}/${currentYear + 2}`,
]

export function FeeForm({ open, onOpenChange, fee, onSuccess }: FeeFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!fee

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateFeeStructure(fee.id, formData)
          toast.success("Fee structure updated successfully")
        } else {
          await createFeeStructure(formData)
          toast.success("Fee structure created successfully")
        }
        onOpenChange(false)
        onSuccess?.()
      } catch (error: any) {
        toast.error(error.message || "Something went wrong")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Fee Structure" : "Create Fee Structure"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the fee structure details."
              : "Define a new fee structure for students."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Fee Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={fee?.name}
                placeholder="e.g., Tuition Fee Year 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeType">Fee Type</Label>
              <Select name="feeType" defaultValue={fee?.feeType || "TUITION"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              defaultValue={fee?.amount}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select name="academicYear" defaultValue={fee?.academicYear || academicYears[0]}>
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
              <Select name="semester" defaultValue={fee?.semester || "SEMESTER_1"}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program (Optional)</Label>
              <Select name="program" defaultValue={fee?.program || "__all__"}>
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Programs</SelectItem>
                  {programs.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog.length > 30 ? prog.slice(0, 30) + "..." : prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year (Optional)</Label>
              <Select name="year" defaultValue={fee?.year?.toString() || "__all__"}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Years</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      Year {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={fee?.description || ""}
              placeholder="Additional details about this fee"
            />
          </div>

          <input type="hidden" name="isActive" value="true" />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
