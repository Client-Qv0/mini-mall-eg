"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartSummary({ subtotal }: { subtotal: number }) {
  const router = useRouter();

  async function handleCheckout() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    if (res.ok && data.data) {
      router.push(`/orders/${data.data.id}`);
      router.refresh();
    } else {
      alert(data.error || "下单失败");
    }
  }

  return (
    <div className="mt-8 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold">合计</span>
        <span className="text-2xl font-bold text-primary">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <Button className="w-full" size="lg" onClick={handleCheckout}>
        结算
      </Button>
    </div>
  );
}
