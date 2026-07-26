import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product || !product.isActive) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-zinc-100 rounded-xl flex items-center justify-center">
          <span className="text-8xl text-zinc-300">{product.name.charAt(0)}</span>
        </div>

        <div>
          <p className="text-sm text-zinc-500 mb-2">{product.category.name}</p>
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-primary mb-4">
            {formatCurrency(product.price)}
          </p>

          {avgRating > 0 && (
            <p className="text-sm text-zinc-500 mb-4">
              ★ {avgRating.toFixed(1)}（{product.reviews.length} 条评价）
            </p>
          )}

          <p className="text-zinc-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          <p className="text-sm text-zinc-500 mb-4">
            库存：{product.stock > 0 ? product.stock : "已售罄"}
          </p>

          {product.stock > 0 && (
            <button className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors cursor-pointer">
              加入购物车
            </button>
          )}
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-16 border-t border-zinc-200 pt-10">
          <h2 className="text-xl font-bold mb-6">用户评价</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-zinc-50 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {review.user.username}
                  </span>
                  <span className="text-yellow-500 text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-zinc-600">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
