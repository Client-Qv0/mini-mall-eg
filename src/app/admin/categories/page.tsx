"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

type Category = {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  function openCreate() {
    setEditId(null);
    setName("");
    setSlug("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const url = editId ? `/api/categories/${editId}` : "/api/categories";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    if (res.ok) {
      setModalOpen(false);
      router.refresh();
      const data = await fetch("/api/categories").then((r) => r.json());
      setCategories(data.data || []);
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除该分类吗？")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "删除失败");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Button onClick={openCreate}>新建分类</Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                名称
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                Slug
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                商品数
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-4 py-3 text-right">
                  {cat._count?.products ?? 0}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-primary hover:underline text-xs cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500 hover:underline text-xs cursor-pointer"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "编辑分类" : "新建分类"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="分类名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. electronics"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            {editId ? "保存" : "创建"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
