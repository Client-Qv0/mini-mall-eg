import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set");
    return new TextEncoder().encode("fallback-only-for-middleware-edge");
  }
  return new TextEncoder().encode(secret);
}

const SECRET = getSecret();

const adminOnlyPaths = ["/admin", "/api/admin"];

const userOnlyPaths = [
  "/api/cart",
  "/api/orders",
  "/api/orders",
  "/api/coupon",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = adminOnlyPaths.some((p) => pathname.startsWith(p));

  if (!isAdminPath) {
    const isUserPath = userOnlyPaths.some((p) => pathname.startsWith(p));
    if (!isUserPath) return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const user = payload as unknown as {
      id: number;
      role: string;
    };

    if (isAdminPath && user.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "无权限" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/cart/:path*", "/api/orders/:path*", "/api/coupon/:path*"],
};
