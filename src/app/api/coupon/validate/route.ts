import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { validateCouponSchema } from "@/validations/coupon";
import { formatCurrency } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = validateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { code, orderTotal } = parsed.data;

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "优惠券无效" }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "优惠券已过期" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "优惠券已用完" }, { status: 400 });
    }

    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `订单金额需满 ${formatCurrency(coupon.minOrderValue)} 才能使用`,
        },
        { status: 400 }
      );
    }

    const discountAmount =
      coupon.discountType === "PERCENTAGE"
        ? Math.floor((orderTotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    return NextResponse.json({
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        discountedTotal: orderTotal - discountAmount,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
