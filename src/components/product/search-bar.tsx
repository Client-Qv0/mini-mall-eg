"use client";

import { useRouter, useSearchParams } from "next/navigation";

type SearchBarProps = {
  initialValue: string;
  categoryId: string;
};

export function SearchBar({ initialValue, categoryId }: SearchBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="search"
        defaultValue={initialValue}
        placeholder="搜索商品..."
        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
      >
        搜索
      </button>
    </form>
  );
}
