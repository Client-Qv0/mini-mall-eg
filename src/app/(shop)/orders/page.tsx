import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/order-status-badge";

export default async function OrdersPage() {
  const user = await getSession();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-500 mb-4">请先登录后查看订单</p>
        <Link
          href="/auth/login"
          className="text-primary hover:underline text-sm font-medium"
        >
          去登录
        </Link>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-500 mb-4">还没有订单</p>
        <Link
          href="/products"
          className="text-primary hover:underline text-sm font-medium"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的订单</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block p-6 rounded-xl border border-zinc-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500">
                订单 #{order.id}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">
                {order.items.length} 件商品
              </span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
