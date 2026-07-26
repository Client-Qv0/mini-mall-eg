import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createOrderSchema } from "@/validations/order";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { couponCode } = parsed.data;

    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error("购物车为空");
      }

      let subtotal = 0;
      for (const item of cartItems) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });
        if (item.quantity > product.stock) {
          throw new Error(`${product.name} 库存不足`);
        }
        subtotal += product.price * item.quantity;
      }

      let discountAmount = 0;
      let couponId: number | null = null;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
        });

        if (!coupon || !coupon.isActive) {
          throw new Error("优惠券无效");
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new Error("优惠券已过期");
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          throw new Error("优惠券已用完");
        }

        if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
          throw new Error(
            `订单金额需满 ¥${(coupon.minOrderValue / 100).toFixed(2)}`
          );
        }

        discountAmount =
          coupon.discountType === "PERCENTAGE"
            ? Math.floor((subtotal * coupon.discountValue) / 100)
            : coupon.discountValue;

        couponId = coupon.id;
      }

      const total = Math.max(0, subtotal - discountAmount);

      const created = await tx.order.create({
        data: {
          userId: user.id,
          subtotal,
          discountAmount,
          total,
          couponId,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    if (
      e instanceof Error &&
      ["购物车为空", "库存不足", "优惠券无效", "优惠券已过期", "优惠券已用完"].some((m) =>
        e.message.includes(m)
      )
    ) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireUser();

    const where = user.role === "admin" ? {} : { userId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        coupon: true,
        user: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: orders });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
