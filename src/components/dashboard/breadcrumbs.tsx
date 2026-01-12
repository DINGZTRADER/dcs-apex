"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  staff: "Staff",
  students: "Students",
  payments: "Payments",
  finance: "Expenses",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/")
        const isLast = index === segments.length - 2
        const label = pathLabels[segment] || segment

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            <Link
              href={href}
              className={cn(
                "capitalize hover:text-foreground transition-colors",
                isLast && "text-foreground font-medium"
              )}
            >
              {label}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
