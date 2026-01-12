"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Users, GraduationCap, Wallet, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "staff" | "student" | "expense"
  name: string
  action: string
  createdAt: Date
  status?: string
}

interface RecentActivityProps {
  items: ActivityItem[]
}

const icons = {
  staff: Users,
  student: GraduationCap,
  expense: Wallet,
}

const iconColors = {
  staff: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  student: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  expense: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No recent activity to display
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => {
              const Icon = icons[item.type]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      "rounded-lg p-2 shrink-0",
                      iconColors[item.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.action}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {item.status && (
                      <Badge
                        variant={
                          item.status === "ACTIVE"
                            ? "success"
                            : item.status === "PENDING"
                            ? "warning"
                            : "secondary"
                        }
                        className="mt-1 text-xs"
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
