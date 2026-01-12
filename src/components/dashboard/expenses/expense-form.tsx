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
import { createExpense, updateExpense } from "@/lib/actions/expenses"

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  status: string
}

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  onSuccess?: () => void
}

const categories = [
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
  "Equipment",
  "Library Resources",
  "Student Services",
  "Marketing",
  "Events",
]

const statuses = ["PENDING", "APPROVED", "REJECTED", "PAID"]

export function ExpenseForm({ open, onOpenChange, expense, onSuccess }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!expense

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateExpense(expense.id, formData)
          toast.success("Expense updated successfully")
        } else {
          await createExpense(formData)
          toast.success("Expense created successfully")
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
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this expense."
              : "Fill in the details to add a new expense."}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={expense?.category || categories[0]}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={expense?.description}
              placeholder="Enter expense description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              defaultValue={expense?.amount}
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={expense?.status || "PENDING"}>
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
