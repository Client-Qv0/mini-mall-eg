"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

type Coupon = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    usageLimit: "",
    expiresAt: "",
    isActive: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.data || []);
  }

  function openCreate() {
    setEditId(null);
    setForm({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderValue: "",
      usageLimit: "",
      expiresAt: "",
      isActive: true,
    });
    setError("");
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderValue: coupon.minOrderValue ? String(coupon.minOrderValue) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: coupon.isActive,
    });
    setError("");
    setModalOpen(true);
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const body = {
      code: form.code,
      discountType: form.discountType,
      discountValue: parseInt(form.discountValue),
      minOrderValue: form.minOrderValue ? parseInt(form.minOrderValue) : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    const url = editId
      ? `/api/admin/coupons/${editId}`
      : "/api/admin/coupons";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setModalOpen(false);
      fetchCoupons();
      router.refresh();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "操作失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除该优惠券吗？")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    fetchCoupons();
    router.refresh();
  }

  function discountLabel(coupon: Coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }
    return formatCurrency(coupon.discountValue);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">优惠券管理</h1>
        <Button onClick={openCreate}>新建优惠券</Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                优惠码
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                折扣
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">
                最低消费
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-600">
                用量
              </th>
              <th className="text-center px-4 py-3 font-medium text-zinc-600">
                状态
              </th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="px-4 py-3 font-mono font-medium">
                  {coupon.code}
                </td>
                <td className="px-4 py-3">{discountLabel(coupon)}</td>
                <td className="px-4 py-3">
                  {coupon.minOrderValue
                    ? formatCurrency(coupon.minOrderValue)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {coupon.usedCount}
                  {coupon.usageLimit ? `/${coupon.usageLimit}` : "/∞"}
                </td>
                <td className="px-4 py-3 text-center">
                  {coupon.isActive ? (
                    <span className="text-green-600 text-xs">启用</span>
                  ) : (
                    <span className="text-zinc-400 text-xs">禁用</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEdit(coupon)}
                    className="text-primary hover:underline text-xs cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
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
        title={editId ? "编辑优惠券" : "新建优惠券"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="优惠码"
            value={form.code}
            onChange={(e) => updateField("code", e.target.value)}
            placeholder="e.g. SUMMER20"
            disabled={!!editId}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                折扣类型
              </label>
              <select
                value={form.discountType}
                onChange={(e) => updateField("discountType", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PERCENTAGE">百分比</option>
                <option value="FIXED">固定金额（分）</option>
              </select>
            </div>
            <Input
              label={form.discountType === "PERCENTAGE" ? "百分比 (1-100)" : "金额（分）"}
              type="number"
              value={form.discountValue}
              onChange={(e) => updateField("discountValue", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="最低消费（分，选填）"
              type="number"
              value={form.minOrderValue}
              onChange={(e) => updateField("minOrderValue", e.target.value)}
            />
            <Input
              label="使用次数上限（选填）"
              type="number"
              value={form.usageLimit}
              onChange={(e) => updateField("usageLimit", e.target.value)}
            />
          </div>

          <Input
            label="过期时间（选填）"
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => updateField("expiresAt", e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-zinc-700">
              启用
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            {editId ? "保存" : "创建"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
