import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">登录</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-center text-zinc-500">
          还没有账号？{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
