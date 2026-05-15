import { describe, it, expect, beforeEach } from "vitest";
import { _resetBuckets, checkRateLimit, hashIp } from "@/lib/rate-limit";

beforeEach(() => {
  _resetBuckets();
});

describe("checkRateLimit", () => {
  it("allows the first hit and reports remaining", () => {
    const result = checkRateLimit("ip-a");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("allows exactly ten hits per window", () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit("ip-b");
      expect(r.allowed).toBe(true);
    }
    const blocked = checkRateLimit("ip-b");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("isolates counts per key", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("ip-c");
    expect(checkRateLimit("ip-c").allowed).toBe(false);
    expect(checkRateLimit("ip-d").allowed).toBe(true);
  });
});

describe("hashIp", () => {
  it("returns deterministic, fixed-length output", () => {
    const a = hashIp("203.0.113.5");
    const b = hashIp("203.0.113.5");
    expect(a).toBe(b);
    expect(a).toHaveLength(32);
  });

  it("never echoes the raw IP", () => {
    const out = hashIp("203.0.113.5");
    expect(out).not.toContain("203");
    expect(out).not.toContain("113");
  });
});
