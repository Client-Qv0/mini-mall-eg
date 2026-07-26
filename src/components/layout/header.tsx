import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export async function Header() {
  const user = await getSession();

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
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            购物车
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
