import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { vippsEnv } from "./vipps";
import { settleVippsPayment } from "./vipps-settle";

type Row = Record<string, unknown>;

/** Minimal in-memory stand-in for the parts of supabase-js that settleVippsPayment uses. */
function fakeDb(seed: { vipps_payments: Row[]; members: Row[]; member_payments?: Row[] }) {
  const tables: Record<string, Row[]> = { member_payments: [], ...seed };
  const client = {
    from(name: string) {
      const rows = tables[name];
      let filter: [string, unknown] | null = null;
      const pick = () => rows.filter((r) => !filter || r[filter[0]] === filter[1]);
      const chain = {
        select: () => chain,
        eq(col: string, val: unknown) {
          filter = [col, val];
          return chain;
        },
        maybeSingle: async () => ({ data: pick()[0] ?? null, error: null }),
        single: async () => ({ data: pick()[0] ?? null, error: null }),
        insert: async (row: Row) => {
          if (name === "member_payments" && rows.some((r) => r.member_id === row.member_id && r.covers_year === row.covers_year)) {
            return { error: { code: "23505" } };
          }
          rows.push(row);
          return { error: null };
        },
        update: (patch: Row) => ({
          eq: async (col: string, val: unknown) => {
            rows.filter((r) => r[col] === val).forEach((r) => Object.assign(r, patch));
            return { error: null };
          },
        }),
      };
      return chain;
    },
  };
  return { client: client as unknown as SupabaseClient, tables };
}

const cfg = vippsEnv({ VIPPS_CLIENT_ID: "a", VIPPS_CLIENT_SECRET: "b", VIPPS_SUBSCRIPTION_KEY: "c", VIPPS_MSN: "1" })!;
const REF = "mh-11111111-1111-1111-1111-111111111111";

function vippsFetch(state: { value: "CREATED" | "AUTHORIZED" | "ABORTED"; authorized: number; captured: number }) {
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    if (u.endsWith("/accesstoken/get")) return new Response(JSON.stringify({ access_token: "t" }), { status: 200 });
    if (u.endsWith("/capture")) {
      state.captured = state.authorized;
      return new Response("{}", { status: 200 });
    }
    void init;
    return new Response(
      JSON.stringify({
        state: state.value,
        amount: { value: 10000 },
        aggregate: { authorizedAmount: { value: state.authorized }, capturedAmount: { value: state.captured } },
      }),
      { status: 200 },
    );
  }) as unknown as typeof fetch;
}

let db: ReturnType<typeof fakeDb>;
const sendMail = vi.fn();

beforeEach(() => {
  sendMail.mockReset().mockResolvedValue({});
  db = fakeDb({
    vipps_payments: [{ reference: REF, member_id: "m1", covers_year: 2026, amount_ore: 10000, status: "created" }],
    members: [{ id: "m1", first_name: "Kari", email: "kari@example.invalid", pay_token: "tok-1", expires_at: null }],
  });
});

const run = (f: typeof fetch) => settleVippsPayment(REF, { supabase: db.client, cfg, today: "2026-11-11", site: "https://site.test", fetchFn: f, sendMail });

describe("settleVippsPayment", () => {
  it("returns unknown for an unknown reference", async () => {
    db.tables.vipps_payments.length = 0;
    expect(await run(vippsFetch({ value: "CREATED", authorized: 0, captured: 0 }))).toBe("unknown");
  });

  it("stays pending until the customer has approved", async () => {
    expect(await run(vippsFetch({ value: "CREATED", authorized: 0, captured: 0 }))).toBe("pending");
    expect(db.tables.member_payments).toHaveLength(0);
  });

  it("marks the payment failed when the customer cancels, and never registers it", async () => {
    expect(await run(vippsFetch({ value: "ABORTED", authorized: 0, captured: 0 }))).toBe("failed");
    expect(db.tables.vipps_payments[0].status).toBe("failed");
    expect(db.tables.member_payments).toHaveLength(0);
  });

  it("captures an approved payment, registers it once and sends one receipt", async () => {
    const state = { value: "AUTHORIZED" as const, authorized: 10000, captured: 0 };
    const f = vippsFetch(state);
    expect(await run(f)).toBe("paid");
    expect(db.tables.member_payments).toEqual([
      { member_id: "m1", covers_year: 2026, amount: 100, method: "vipps", reference: REF, paid_at: "2026-11-11" },
    ]);
    expect(db.tables.members[0]).toMatchObject({ paid_at: "2026-11-11", expires_at: "2026-12-31" });
    expect(sendMail).toHaveBeenCalledTimes(1);

    // Kalles den igjen (retursiden + webhook + nattlig kjøring): ingenting skjer to ganger.
    expect(await run(f)).toBe("paid");
    expect(db.tables.member_payments).toHaveLength(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("does not capture or register when the approved amount differs from what we asked for", async () => {
    const f = vippsFetch({ value: "AUTHORIZED", authorized: 100, captured: 0 });
    expect(await run(f)).toBe("failed");
    expect(db.tables.member_payments).toHaveLength(0);
    expect(f).not.toHaveBeenCalledWith(expect.stringContaining("/capture"), expect.anything());
  });

  it("does not send a second receipt when the payment was already registered (e.g. by an admin)", async () => {
    db.tables.member_payments.push({ member_id: "m1", covers_year: 2026, amount: 100, method: "bank" });
    expect(await run(vippsFetch({ value: "AUTHORIZED", authorized: 10000, captured: 0 }))).toBe("paid");
    expect(db.tables.member_payments).toHaveLength(1);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("never moves an existing, later expiry backwards", async () => {
    db.tables.members[0].expires_at = "2027-12-31";
    expect(await run(vippsFetch({ value: "AUTHORIZED", authorized: 10000, captured: 0 }))).toBe("paid");
    expect(db.tables.members[0].expires_at).toBe("2027-12-31");
  });
});

import { settleVippsDonation } from "./vipps-settle";

describe("settleVippsDonation", () => {
  const GREF = "gv-22222222-2222-2222-2222-222222222222";
  const dbGift = () => fakeDb({ vipps_payments: [], members: [], ...{ vipps_donations: [{ reference: GREF, amount_ore: 10000, status: "created" }] } } as never);

  it("captures an approved gift once and marks it received", async () => {
    const g = dbGift();
    const f = vippsFetch({ value: "AUTHORIZED", authorized: 10000, captured: 0 });
    expect(await settleVippsDonation(GREF, { supabase: g.client, cfg, fetchFn: f })).toBe("paid");
    expect(g.tables.vipps_donations[0].status).toBe("captured");
    expect(await settleVippsDonation(GREF, { supabase: g.client, cfg, fetchFn: f })).toBe("paid");
  });

  it("stays pending until approved and fails when cancelled or the amount differs", async () => {
    let g = dbGift();
    expect(await settleVippsDonation(GREF, { supabase: g.client, cfg, fetchFn: vippsFetch({ value: "CREATED", authorized: 0, captured: 0 }) })).toBe("pending");
    g = dbGift();
    expect(await settleVippsDonation(GREF, { supabase: g.client, cfg, fetchFn: vippsFetch({ value: "ABORTED", authorized: 0, captured: 0 }) })).toBe("failed");
    g = dbGift();
    expect(await settleVippsDonation(GREF, { supabase: g.client, cfg, fetchFn: vippsFetch({ value: "AUTHORIZED", authorized: 500, captured: 0 }) })).toBe("failed");
  });

  it("returns unknown for an unknown reference", async () => {
    const g = fakeDb({ vipps_payments: [], members: [], vipps_donations: [] } as never);
    expect(await settleVippsDonation(GREF, { supabase: g.client, cfg })).toBe("unknown");
  });
});
