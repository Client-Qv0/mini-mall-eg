import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新建商品</h1>
      <div className="bg-white rounded-xl border border-zinc-200 p-6 max-w-lg">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
