"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReviewForm({ productId }: { productId: number }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("请评分");
      return;
    }

    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment || undefined }),
    });

    if (res.ok) {
      setSubmitted(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "提交失败");
    }
  }

  if (submitted) {
    return (
      <div className="p-4 bg-green-50 rounded-lg text-sm text-green-700">
        评价提交成功！
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-zinc-50 rounded-xl">
      <h3 className="font-semibold text-zinc-900">写评价</h3>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl cursor-pointer transition-colors ${
              star <= rating ? "text-yellow-400" : "text-zinc-300"
            }`}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-zinc-500 ml-2">
          {rating > 0 ? `${rating} 星` : "点击评分"}
        </span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="说说你的使用体验（选填）"
        maxLength={500}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" size="sm">
        提交评价
      </Button>
    </form>
  );
}
