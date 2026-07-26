import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">商品分类</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="px-4 py-2 rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-primary hover:text-white transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">精选商品</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                <span className="text-4xl text-zinc-300">
                  {product.name.charAt(0)}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm text-zinc-500 mb-1">
                  {product.category.name}
                </p>
                <h3 className="font-medium text-zinc-900 group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="mt-2 text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
