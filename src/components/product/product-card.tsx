import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
};

export function ProductCard({
  id,
  name,
  price,
  imageUrl: _imageUrl,
  categoryName,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow block"
    >
      <div className="aspect-square bg-zinc-100 flex items-center justify-center">
        <span className="text-5xl text-zinc-300">{name.charAt(0)}</span>
      </div>
      <div className="p-4">
        <p className="text-xs text-zinc-500 mb-1">{categoryName}</p>
        <h3 className="font-medium text-zinc-900 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        <p className="mt-2 text-lg font-bold text-primary">
          {formatCurrency(price)}
        </p>
      </div>
    </Link>
  );
}
