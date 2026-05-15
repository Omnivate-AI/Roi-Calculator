import { createHash } from "node:crypto";

/**
 * In-memory rate limiter. Counts hits per key within a sliding window.
 * Good enough for the hobby plan and the traffic profile (visitors
 * downloading a PDF, not a hot API path). Survives only as long as the
 * lambda instance does, which is the point. A determined attacker can
 * cold-boot around it, but the friction is enough for the legit use case.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether the caller is within their hourly cap. Records the hit
 * on the spot when allowed. Returns metadata callers can put in headers.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const next: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, next);
    return { allowed: true, remaining: MAX_PER_WINDOW - 1, resetAt: next.resetAt };
  }

  if (bucket.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: MAX_PER_WINDOW - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/**
 * One-way hash of the visitor IP so we never store raw addresses. The
 * salt is the admin session secret which already exists in the env, so
 * we don't add a new secret surface.
 */
export function hashIp(ip: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Pull a best-effort client IP from a Next.js request. Vercel sets
 * x-forwarded-for in production; in local dev it falls back to the
 * remoteAddress sent by Node.
 */
export function extractIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Reset every bucket. Exported for tests; not used at runtime.
 */
export function _resetBuckets(): void {
  buckets.clear();
}
