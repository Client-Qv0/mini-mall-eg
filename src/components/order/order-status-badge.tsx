import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

const statusMap: Record<OrderStatus, string> = {
  pending: "待付款",
  paid: "已付款",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

const colorMap: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorMap[status as OrderStatus] || colorMap.pending
      )}
    >
      {statusMap[status as OrderStatus] || status}
    </span>
  );
}
