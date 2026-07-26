import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/product-card";
import { SearchBar } from "@/components/product/search-bar";
import { CategoryFilter } from "@/components/product/category-filter";
import { Pagination } from "@/components/ui/pagination";

type SearchParams = Promise<{
  search?: string;
  categoryId?: string;
  page?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const search = sp.search || "";
  const categoryId = sp.categoryId || "";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const pageSize = 12;

  const [productsData, categories] = await Promise.all([
    fetch(
      `http://localhost:3000/api/products?search=${encodeURIComponent(search)}&categoryId=${categoryId}&page=${page}&pageSize=${pageSize}`,
      { cache: "no-store" }
    ).then((r) => r.json()),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const { data: products, totalPages } = productsData;

  const baseUrl = `/products?${new URLSearchParams({ search, categoryId }).toString()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0">
          <CategoryFilter
            categories={categories}
            selectedId={categoryId}
            search={search}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <SearchBar initialValue={search} categoryId={categoryId} />

          {products?.length === 0 ? (
            <p className="text-center text-zinc-500 mt-16">没有找到商品</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {products?.map((product: { id: number; name: string; price: number; imageUrl: string | null; category: { name: string } }) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  categoryName={product.category.name}
                />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages || 1} baseUrl={baseUrl} />
        </div>
      </div>
    </div>
  );
}
