import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { PayButton } from "@/components/order/pay-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();

  if (!user) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      items: { include: { product: true } },
      coupon: true,
    },
  });

  if (!order || (order.userId !== user.id && user.role !== "admin")) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">订单详情</h1>
      <p className="text-sm text-zinc-500 mb-8">
        订单 #{order.id} &middot;{" "}
        {new Date(order.createdAt).toLocaleDateString("zh-CN")}
      </p>

      <div className="rounded-xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">状态</span>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.status === "pending" && (
          <PayButton orderId={order.id} />
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 overflow-hidden mb-6">
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200">
          <span className="text-sm font-medium text-zinc-600">商品明细</span>
        </div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100 last:border-b-0"
          >
            <div className="w-14 h-14 shrink-0 bg-zinc-100 rounded-lg flex items-center justify-center">
              <span className="text-lg text-zinc-300">
                {item.product.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {item.product.name}
              </p>
              <p className="text-sm text-zinc-500">
                {formatCurrency(item.price)} &times; {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-zinc-900">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-zinc-500">小计</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-500">
              优惠
              {order.coupon && (
                <span className="ml-1 text-xs bg-zinc-200 px-1.5 py-0.5 rounded">
                  {order.coupon.code}
                </span>
              )}
            </span>
            <span className="text-red-500">
              -{formatCurrency(order.discountAmount)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-zinc-200 mt-2">
          <span>实付</span>
          <span className="text-primary">{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
