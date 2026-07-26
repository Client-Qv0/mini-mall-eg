"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order/order-status-badge";

type Order = {
  id: number;
  status: string;
  total: number;
  user: { username: string };
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []));
  }, []);

  async function updateStatus(orderId: number, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                订单号
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                用户
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                金额
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-600">
                状态
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    #{order.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {order.user?.username}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-3 text-center">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs border border-zinc-300 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="pending">待付款</option>
                    <option value="paid">已付款</option>
                    <option value="shipped">已发货</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
