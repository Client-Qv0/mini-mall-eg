import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateCartItemSchema } from "@/validations/cart";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
      include: { product: true },
    });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    if (parsed.data.quantity > item.product.stock) {
      return NextResponse.json({ error: "库存不足" }, { status: 400 });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parsed.data.quantity },
    });

    return NextResponse.json({ data: "已更新" });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ data: "已删除" });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
