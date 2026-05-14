import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin auth: shared password + signed session cookie. No Supabase Auth.
 *
 * Flow:
 *   1. Visitor enters the password on /admin/login.
 *   2. Server compares it (constant-time) to ADMIN_PASSWORD env var.
 *   3. On match, server signs a small payload ({ admin: true, exp: now+7d })
 *      with an HMAC using ADMIN_SESSION_SECRET and sets it as an httpOnly,
 *      secure, sameSite=strict cookie.
 *   4. On every /admin request, server verifies the cookie signature and
 *      expiration. Invalid → redirect to /admin/login.
 *
 * Stateless. No DB hit per request. Cookie cannot be forged without the
 * session secret. Logout just clears the cookie.
 */

const COOKIE_NAME = "roi_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  admin: true;
  exp: number; // unix seconds
}

/**
 * Returns true if the request carries a valid, unexpired admin session
 * cookie. False otherwise. Use this in server components and server
 * actions to gate access.
 */
export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const payload = verifySession(raw, secret);
  return payload !== null;
}

/**
 * Verifies the submitted password against ADMIN_PASSWORD and, on match,
 * sets the session cookie. Returns true on success, false on invalid
 * password.
 */
export async function tryLogin(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) return false;

  // Constant-time compare to avoid timing attacks.
  const submittedBuf = Buffer.from(password, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (submittedBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(submittedBuf, expectedBuf)) return false;

  const payload: SessionPayload = {
    admin: true,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = signSession(payload, secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return true;
}

/**
 * Clears the session cookie. Caller should redirect to /admin/login.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

// ---------- HMAC token helpers ----------

function signSession(payload: SessionPayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verifySession(token: string, secret: string): SessionPayload | null {
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) return null;
  const data = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!data || !signature) return null;

  const expectedSig = createHmac("sha256", secret).update(data).digest("base64url");
  const aBuf = Buffer.from(signature);
  const bBuf = Buffer.from(expectedSig);
  if (aBuf.length !== bBuf.length || !timingSafeEqual(aBuf, bBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.admin || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
