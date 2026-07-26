import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth";
import { setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = rateLimit(`register:${ip}`, 3, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "邮箱或用户名已存在" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    await setSession({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as "customer" | "admin",
    });

    return NextResponse.json({ data: { id: user.id, username, email } });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
