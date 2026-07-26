"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/order-status-badge";

type OrderDetail = {
  id: number;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  coupon: { code: string } | null;
  user: { username: string; email: string };
  items: {
    id: number;
    quantity: number;
    price: number;
    product: { name: string };
  }[];
  createdAt: string;
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.data));
  }, [id]);

  if (!order) {
    return <p className="text-zinc-500">加载中...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">订单 #{order.id}</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {order.user.username} ({order.user.email}) &middot;{" "}
        {new Date(order.createdAt).toLocaleDateString("zh-CN")}
      </p>

      <div className="mb-6">
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden mb-6">
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 text-sm font-medium text-zinc-600">
          商品明细
        </div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-6 py-3 border-b border-zinc-100 last:border-b-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-zinc-500">
                {formatCurrency(item.price)} &times; {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold text-zinc-900">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-zinc-500">小计</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-500">
              优惠{order.coupon && ` (${order.coupon.code})`}
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
