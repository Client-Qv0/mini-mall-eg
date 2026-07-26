import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ data: null });
    }
    return NextResponse.json({ data: user });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
