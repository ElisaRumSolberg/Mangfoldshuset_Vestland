import { describe, expect, it, vi, beforeEach } from "vitest";

const getUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

const { requireEditor, requireOwner, requireUtvalgAccess } = await import("./auth-guard");

function mockUser(role?: string, utvalgId?: string) {
  getUser.mockResolvedValue({
    data: { user: { app_metadata: { role, utvalg_id: utvalgId } } },
  });
}

function mockLoggedOut() {
  getUser.mockResolvedValue({ data: { user: null } });
}

beforeEach(() => {
  getUser.mockReset();
});

describe("requireOwner", () => {
  it("resolves for an owner", async () => {
    mockUser("owner");
    await expect(requireOwner()).resolves.toBeUndefined();
  });

  it("resolves when no role is set (defaults to owner)", async () => {
    mockUser(undefined);
    await expect(requireOwner()).resolves.toBeUndefined();
  });

  it("throws for an editor", async () => {
    mockUser("editor");
    await expect(requireOwner()).rejects.toThrow();
  });

  it("throws when logged out", async () => {
    mockLoggedOut();
    await expect(requireOwner()).rejects.toThrow();
  });
});

describe("requireEditor", () => {
  it("resolves for owner and editor", async () => {
    mockUser("owner");
    await expect(requireEditor()).resolves.toBeUndefined();
    mockUser("editor");
    await expect(requireEditor()).resolves.toBeUndefined();
  });

  it("throws for utvalg", async () => {
    mockUser("utvalg", "utvalg-1");
    await expect(requireEditor()).rejects.toThrow();
  });
});

describe("requireUtvalgAccess", () => {
  it("allows owner and editor regardless of utvalg id", async () => {
    mockUser("owner");
    await expect(requireUtvalgAccess("utvalg-1")).resolves.toBeUndefined();
    mockUser("editor");
    await expect(requireUtvalgAccess("utvalg-2")).resolves.toBeUndefined();
  });

  it("allows an utvalg user for their own utvalg only", async () => {
    mockUser("utvalg", "utvalg-1");
    await expect(requireUtvalgAccess("utvalg-1")).resolves.toBeUndefined();
    await expect(requireUtvalgAccess("utvalg-2")).rejects.toThrow();
  });

  it("throws when logged out", async () => {
    mockLoggedOut();
    await expect(requireUtvalgAccess("utvalg-1")).rejects.toThrow();
  });
});
