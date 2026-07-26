import Link from "next/link";
import { cn } from "@/lib/utils";

type CategoryFilterProps = {
  categories: { id: number; name: string; slug: string }[];
  selectedId: string;
  search: string;
};

export function CategoryFilter({
  categories,
  selectedId,
  search,
}: CategoryFilterProps) {
  const buildHref = (categoryId?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    return `/products?${params.toString()}`;
  };

  return (
    <div>
      <h3 className="font-semibold text-zinc-900 mb-3">商品分类</h3>
      <ul className="space-y-1">
        <li>
          <Link
            href={buildHref()}
            className={cn(
              "block px-3 py-1.5 rounded-lg text-sm transition-colors",
              !selectedId
                ? "bg-primary text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            全部分类
          </Link>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={buildHref(String(cat.id))}
              className={cn(
                "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                selectedId === String(cat.id)
                  ? "bg-primary text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
