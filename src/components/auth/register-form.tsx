"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (typeof data.error === "string") {
        setServerError(data.error);
      } else {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(data.error)) {
          fieldErrors[key] = (msgs as string[])[0];
        }
        setErrors(fieldErrors);
      }
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        error={errors.username}
      />
      <Input
        name="email"
        type="email"
        label="邮箱"
        placeholder="请输入邮箱"
        error={errors.email}
      />
      <Input
        name="password"
        type="password"
        label="密码"
        placeholder="至少6个字符"
        error={errors.password}
      />
      {serverError && (
        <p className="text-sm text-red-500 text-center">{serverError}</p>
      )}
      <Button type="submit" className="w-full">
        注册
      </Button>
    </form>
  );
}
