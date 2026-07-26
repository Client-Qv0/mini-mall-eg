import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { couponSchema } from "@/validations/coupon";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: coupons });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.coupon.findUnique({
      where: { code: parsed.data.code },
    });
    if (existing) {
      return NextResponse.json({ error: "优惠码已存在" }, { status: 409 });
    }

    const data: Record<string, unknown> = {
      code: parsed.data.code,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      minOrderValue: parsed.data.minOrderValue ?? null,
      usageLimit: parsed.data.usageLimit ?? null,
    };

    if (parsed.data.expiresAt) {
      data.expiresAt = new Date(parsed.data.expiresAt);
    }

    const coupon = await prisma.coupon.create({ data: data as never });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "Forbidden") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
