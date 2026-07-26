import Link from "next/link";

export function Header() {
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
          <Link href="/products" className="hover:text-zinc-900 transition-colors">
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
          <Link
            href="/auth/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    </header>
  );
}
