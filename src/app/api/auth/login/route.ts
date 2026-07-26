import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";
import { setSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";

const DUMMY_HASH = "$2a$12$LJ3m4ys3KyP6vQx9sF5Oeu9O0OTKvx9bEqGdGzCEJhZ1MKN1Y5G3m";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = rateLimit(`login:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        await setSession({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role as "customer" | "admin",
        });
        return NextResponse.json({ data: { id: user.id, username: user.username, email: user.email, role: user.role } });
      }
    } else {
      await bcrypt.compare(password, DUMMY_HASH);
    }

    return NextResponse.json(
      { error: "邮箱或密码错误" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
