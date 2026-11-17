import { Badge } from "@/components/ui/badge"
import { orderStatusLabels } from "@/lib/constants"
import type { OrderStatus } from "@/lib/order-schema"
import { cn } from "@/lib/utils"

const statusStyles: Record<OrderStatus, string> = {
    COMPLETED: "border-green-600/20 bg-green-50 text-green-600",
    CANCELLED: "border-prim/20 bg-prim/5 text-prim",
}

export function HistoryStatusBadge({ status }: { status: OrderStatus }) {
    return (
        <Badge variant="outline" className={cn("text-[10px] font-medium", statusStyles[status])}>
            {orderStatusLabels[status]}
        </Badge>
    )
}