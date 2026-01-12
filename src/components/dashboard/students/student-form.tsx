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
import { createStudent, updateStudent } from "@/lib/actions/students"

interface Student {
  id: string
  studentNo: string
  fullName: string
  program: string
  year: number
  status: string
}

interface StudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  onSuccess?: () => void
}

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

const statuses = ["ACTIVE", "DEFERRED", "DROPPED"]
const years = [1, 2, 3, 4, 5, 6, 7]

export function StudentForm({ open, onOpenChange, student, onSuccess }: StudentFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!student

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateStudent(student.id, formData)
          toast.success("Student updated successfully")
        } else {
          await createStudent(formData)
          toast.success("Student created successfully")
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Student" : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this student."
              : "Fill in the details to add a new student."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentNo">Student No.</Label>
              <Input
                id="studentNo"
                name="studentNo"
                defaultValue={student?.studentNo}
                placeholder="e.g. S1001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select name="year" defaultValue={student?.year?.toString() || "1"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      Year {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={student?.fullName}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Select name="program" defaultValue={student?.program || programs[0]}>
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((prog) => (
                  <SelectItem key={prog} value={prog}>
                    {prog}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={student?.status || "ACTIVE"}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
