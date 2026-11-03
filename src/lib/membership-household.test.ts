import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/public-submission", () => ({ savePublicSubmission: mocks.save, notifyAfterSave: async (f: () => Promise<unknown>) => { await f(); } }));
vi.mock("@/lib/spam-guard", () => ({ looksLikeBot: () => false, isRateLimited: async () => false }));
vi.mock("@/lib/resend", () => ({ getResendClient: () => ({ emails: { send: mocks.send } }), isResendConfigured: () => true, NOTIFY_EMAIL: "qa@example.invalid" }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));
vi.mock("@/lib/recurring", async (orig) => ({ ...(await orig<typeof import("@/lib/recurring")>()), todayOslo: () => "2026-11-03" }));
import { submitMembership } from "@/app/bli-med/actions";
import { splitName } from "@/lib/household";

function form(extra: Record<string, string> = {}) {
  const f = new FormData();
  Object.entries({
    first_name: "Kari", last_name: "Nordmann", email: "kari@example.invalid", membership_type: "familie",
    birth_date: "1985-05-01", gender: "kvinne", terms: "on", ...extra,
  }).forEach(([k, v]) => f.set(k, v));
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.save.mockResolvedValue(true);
  mocks.send.mockResolvedValue({ error: null });
});

it("stores every person as their own member row in the same household", async () => {
  const f = form({
    fam_name_2: "Ola Nordmann", fam_birth_2: "1983-02-02", fam_gender_2: "mann",
    fam_name_3: "Liv", fam_birth_3: "2015-09-09", fam_gender_3: "kvinne",
  });
  await expect(submitMembership(f)).rejects.toThrow("?sendt=medlem");
  const rows = mocks.save.mock.calls[0][1];
  expect(mocks.save.mock.calls[0][0]).toBe("members");
  expect(rows).toHaveLength(3);
  expect(new Set(rows.map((r: { household_id: string }) => r.household_id)).size).toBe(1);
  expect(rows.map((r: { first_name: string; last_name: string }) => `${r.first_name} ${r.last_name}`))
    .toEqual(["Kari Nordmann", "Ola Nordmann", "Liv Nordmann"]);
  expect(rows.every((r: { family_members: unknown[] }) => r.family_members.length === 0)).toBe(true);
  expect(rows.every((r: { email: string }) => r.email === "kari@example.invalid")).toBe(true);
  // barn under 18 får hovedmedlemmet som foresatt
  expect(rows[2].guardian).toBe("Kari Nordmann");
  expect(rows[1].guardian).toBeNull();
  expect(mocks.send.mock.calls[0][0].text).toContain("225 kr (2 × 100 kr + 1 × 25 kr)");
});

it("stores a single member as one row", async () => {
  await expect(submitMembership(form({ membership_type: "enkelt" }))).rejects.toThrow("?sendt=medlem");
  expect(mocks.save.mock.calls[0][1]).toHaveLength(1);
});

it("does not send a mail when nothing was saved", async () => {
  mocks.save.mockResolvedValue(false);
  await expect(submitMembership(form({ membership_type: "enkelt" }))).resolves.toEqual({ error: expect.any(String) });
  expect(mocks.send).not.toHaveBeenCalled();
});

it("splits names, giving a single name the main member's surname", () => {
  expect(splitName("Ola Per Nordmann", "X")).toEqual({ first_name: "Ola Per", last_name: "Nordmann" });
  expect(splitName("Liv", "Nordmann")).toEqual({ first_name: "Liv", last_name: "Nordmann" });
});
