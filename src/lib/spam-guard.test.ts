import { describe, expect, it, vi, beforeEach } from "vitest";
import { HONEYPOT_FIELD, TIMESTAMP_FIELD, looksLikeBot } from "./spam-guard";

function formDataWith(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("looksLikeBot", () => {
  it("flags a submission where the honeypot field is filled in", () => {
    const fd = formDataWith({ [HONEYPOT_FIELD]: "http://spam.example" });
    expect(looksLikeBot(fd)).toBe(true);
  });

  it("does not flag a submission with an empty honeypot", () => {
    const fd = formDataWith({ [HONEYPOT_FIELD]: "" });
    expect(looksLikeBot(fd)).toBe(false);
  });

  it("flags a submission sent faster than the minimum fill time", () => {
    const fd = formDataWith({ [TIMESTAMP_FIELD]: String(Date.now()) });
    expect(looksLikeBot(fd)).toBe(true);
  });

  it("does not flag a submission sent after the minimum fill time", () => {
    const fd = formDataWith({ [TIMESTAMP_FIELD]: String(Date.now() - 5000) });
    expect(looksLikeBot(fd)).toBe(false);
  });

  it("does not flag a normal, empty form (no honeypot/timestamp fields present)", () => {
    const fd = new FormData();
    expect(looksLikeBot(fd)).toBe(false);
  });
});

describe("isRateLimited", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/isConfigured", () => ({ isSupabaseConfigured: () => true }));
  });

  it("returns false (does not block) if the underlying query throws", async () => {
    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => {
        throw new Error("no service role key configured");
      },
    }));
    const { isRateLimited } = await import("./spam-guard");
    await expect(isRateLimited("contact_messages", "kari@example.com")).resolves.toBe(false);
  });

  it("returns true once the count reaches the limit", async () => {
    vi.doMock("@/lib/supabase/admin", () => ({
      createAdminClient: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              gte: () => Promise.resolve({ count: 3 }),
            }),
          }),
        }),
      }),
    }));
    const { isRateLimited } = await import("./spam-guard");
    await expect(isRateLimited("contact_messages", "kari@example.com")).resolves.toBe(true);
  });

  it("returns false when there is no email to key on", async () => {
    const { isRateLimited } = await import("./spam-guard");
    await expect(isRateLimited("contact_messages", "")).resolves.toBe(false);
  });
});
