import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ data: "已登出" });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
