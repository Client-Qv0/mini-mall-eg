import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
import Link from "next/link";

export default async function CartPage() {
  const user = await getSession();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-500 mb-4">请先登录后查看购物车</p>
        <Link
          href="/auth/login"
          className="text-primary hover:underline text-sm font-medium"
        >
          去登录
        </Link>
      </div>
    );
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-zinc-500 mb-4">购物车是空的</p>
        <Link
          href="/products"
          className="text-primary hover:underline text-sm font-medium"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">购物车</h1>
      <CartItems items={items} />
      <CartSummary subtotal={subtotal} />
    </div>
  );
}
