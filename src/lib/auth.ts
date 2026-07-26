import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionUser } from "@/types";

const revokedTokens = new Set<string>();

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Please configure it in .env");
  }
  if (secret.length < 16) {
    throw new Error("JWT_SECRET must be at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

const SECRET = getSecret();

const COOKIE_NAME = "token";
const EXPIRES_IN = "7d";

export async function signToken(payload: SessionUser): Promise<{ token: string; jti: string }> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
  return { token, jti };
}

export async function verifyToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.jti && revokedTokens.has(payload.jti as string)) {
      return null;
    }
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export function revokeToken(jti: string): void {
  revokedTokens.add(jti);
}

export async function setSession(user: SessionUser): Promise<void> {
  const { token } = await signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.jti) {
        revokeToken(payload.jti as string);
      }
    } catch {
      // token already invalid, no need to revoke
    }
  }
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}
