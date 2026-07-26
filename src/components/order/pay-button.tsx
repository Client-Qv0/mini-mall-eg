"use client";

import { useRouter } from "next/navigation";

export function PayButton({ orderId }: { orderId: number }) {
  const router = useRouter();

  async function handlePay() {
    const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "支付失败");
    }
  }

  return (
    <button
      onClick={handlePay}
      className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
    >
      模拟支付
    </button>
  );
}
