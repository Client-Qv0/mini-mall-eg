"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CartItemsProps = {
  items: {
    id: number;
    product: {
      id: number;
      name: string;
      price: number;
      imageUrl: string | null;
      stock: number;
    };
    quantity: number;
  }[];
};

export function CartItems({ items }: CartItemsProps) {
  const router = useRouter();

  async function updateQuantity(id: number, quantity: number) {
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    router.refresh();
  }

  async function removeItem(id: number) {
    await fetch(`/api/cart/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200"
        >
          <div className="w-20 h-20 shrink-0 bg-zinc-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-zinc-300">
              {item.product.name.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-zinc-900 truncate">
              {item.product.name}
            </p>
            <p className="text-sm text-primary font-bold mt-1">
              {formatCurrency(item.product.price)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-lg"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock}
              className="w-8 h-8 rounded-lg border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-lg"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="text-sm text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
