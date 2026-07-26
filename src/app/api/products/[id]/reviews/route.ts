import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { reviewSchema } from "@/validations/review";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(id) },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: reviews });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const productId = parseInt(id);

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) {
      return NextResponse.json({ error: "您已经评价过该商品" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
      },
      include: { user: { select: { username: true } } },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
