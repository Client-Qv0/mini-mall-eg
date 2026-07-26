import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">注册</h1>
        <RegisterForm />
        <p className="mt-4 text-sm text-center text-zinc-500">
          已有账号？{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
