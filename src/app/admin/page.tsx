import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "商品总数", value: productCount },
    { label: "订单总数", value: orderCount },
    { label: "用户总数", value: userCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">仪表盘</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-zinc-200 p-6"
          >
            <p className="text-sm text-zinc-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
