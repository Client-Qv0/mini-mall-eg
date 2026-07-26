"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: { name: string };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products?pageSize=100")
      .then((r) => r.json())
      .then((d) => setProducts(d.data || []));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("确定要删除该商品吗？")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link href="/admin/products/new">
          <Button>新建商品</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                名称
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                分类
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                价格
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                库存
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
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {product.category?.name}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-3 text-right">{product.stock}</td>
                <td className="px-4 py-3 text-center">
                  {product.isActive ? (
                    <span className="text-green-600 text-xs">上架</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">下架</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-primary hover:underline text-xs"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:underline text-xs cursor-pointer"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
