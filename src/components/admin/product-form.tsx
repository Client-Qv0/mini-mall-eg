"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ProductFormProps = {
  initialData?: {
    id?: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    imageUrl?: string;
    isActive?: boolean;
  };
  categories: { id: number; name: string }[];
};

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const isEdit = !!initialData?.id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Math.round(parseFloat(formData.get("price") as string) * 100),
      stock: parseInt(formData.get("stock") as string),
      categoryId: parseInt(formData.get("categoryId") as string),
      isActive: formData.get("isActive") === "on",
    };

    const url = isEdit
      ? `/api/products/${initialData!.id}`
      : "/api/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "操作失败");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        name="name"
        label="商品名称"
        defaultValue={initialData?.name}
        required
      />

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          商品描述
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialData?.description}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="price"
          type="number"
          step="0.01"
          label="价格（元）"
          defaultValue={initialData ? (initialData.price / 100).toFixed(2) : ""}
          required
        />
        <Input
          name="stock"
          type="number"
          label="库存"
          defaultValue={initialData?.stock || 0}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          分类
        </label>
        <select
          name="categoryId"
          defaultValue={initialData?.categoryId}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">请选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          name="isActive"
          type="checkbox"
          id="isActive"
          defaultChecked={initialData?.isActive ?? true}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm text-zinc-700">
          上架
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit">{isEdit ? "保存" : "创建"}</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
