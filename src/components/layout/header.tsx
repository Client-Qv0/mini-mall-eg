import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const user = await getSession();

  const cartCount = user
    ? await prisma.cartItem.count({ where: { userId: user.id } })
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        <Link
          href="/"
          className="text-xl font-bold text-primary tracking-tight"
        >
          Mini Mall
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link
            href="/products"
            className="hover:text-zinc-900 transition-colors"
          >
            全部商品
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            购物车
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-4 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                href="/orders"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                我的订单
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  后台
                </Link>
              )}
              <span className="text-sm text-zinc-400">{user.username}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
