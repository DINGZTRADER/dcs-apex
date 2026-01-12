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
import { createStaff, updateStaff } from "@/lib/actions/staff"

interface Staff {
  id: string
  fullName: string
  role: string
  department: string | null
  salary: number
  dob: Date | null
  startDate: Date
  status: string
}

interface StaffFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: Staff | null
  onSuccess?: () => void
}

const roles = ["LECTURER", "SECURITY", "CLEANER", "ADMIN", "OTHER"]
const statuses = ["ACTIVE", "SUSPENDED", "EXITED"]
const departments = [
  "Faculty of Computing & Informatics",
  "Faculty of Education",
  "Faculty of Medicine",
  "Faculty of Business & Management",
  "Faculty of Law",
  "Faculty of Engineering",
  "Faculty of Agriculture",
  "Faculty of Public Health",
  "Faculty of Social Sciences",
  "University Library",
  "Finance Office",
  "Registry",
  "ICT Department",
  "Maintenance Unit",
]

export function StaffForm({ open, onOpenChange, staff, onSuccess }: StaffFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!staff

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateStaff(staff.id, formData)
          toast.success("Staff member updated successfully")
        } else {
          await createStaff(formData)
          toast.success("Staff member created successfully")
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
            {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this staff member."
              : "Fill in the details to add a new staff member."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={staff?.fullName}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue={staff?.role || "LECTURER"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={staff?.status || "ACTIVE"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select name="department" defaultValue={staff?.department || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary (UGX)</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              defaultValue={staff?.salary}
              placeholder="Enter salary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                defaultValue={
                  staff?.dob
                    ? new Date(staff.dob).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  staff?.startDate
                    ? new Date(staff.startDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                required
              />
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
