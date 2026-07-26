import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireUser } from "@/lib/auth";
import { addCartItemSchema } from "@/validations/cart";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ data: [], total: 0 });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return NextResponse.json({ data: items, total });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return NextResponse.json({ error: "库存不足" }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      if (quantity > product.stock) {
        return NextResponse.json({ error: "库存不足" }, { status: 400 });
      }
      await prisma.cartItem.create({
        data: { userId: user.id, productId, quantity },
      });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: { include: { category: true } } },
    });
    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return NextResponse.json({ data: items, total });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
