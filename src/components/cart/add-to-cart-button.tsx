"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ productId }: { productId: number }) {
  const router = useRouter();

  async function handleAdd() {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "添加失败");
    }
  }

  return (
    <Button onClick={handleAdd} size="lg">
      加入购物车
    </Button>
  );
}
