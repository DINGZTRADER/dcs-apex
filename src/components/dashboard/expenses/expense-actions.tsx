"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, Trash2, Loader2, CheckCircle, XCircle, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteExpense, updateExpense } from "@/lib/actions/expenses"
import { ExpenseForm } from "./expense-form"

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  status: string
}

interface ExpenseActionsProps {
  expense: Expense
  onUpdate?: () => void
}

export function ExpenseActions({ expense, onUpdate }: ExpenseActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteExpense(expense.id)
        toast.success("Expense deleted successfully")
        setShowDeleteDialog(false)
        onUpdate?.()
      } catch (error: any) {
        toast.error(error.message || "Failed to delete expense")
      }
    })
  }

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("status", newStatus)
        await updateExpense(expense.id, formData)
        toast.success(`Expense ${newStatus.toLowerCase()}`)
        onUpdate?.()
      } catch (error: any) {
        toast.error(error.message || "Failed to update status")
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          
          {expense.status === "PENDING" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange("APPROVED")}
                className="text-emerald-600 focus:text-emerald-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("REJECTED")}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
          
          {expense.status === "APPROVED" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange("PAID")}
                className="text-blue-600 focus:text-blue-600"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Mark as Paid
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExpenseForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        expense={expense}
        onSuccess={onUpdate}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the expense for{" "}
              <span className="font-semibold">{expense.category}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
