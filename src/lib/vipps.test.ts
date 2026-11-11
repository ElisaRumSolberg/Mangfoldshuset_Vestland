import { describe, expect, it, vi } from "vitest";
import { capturePayment, createPayment, getPayment, isReference, newReference, toOre, vippsEnv } from "./vipps";

const KEYS = {
  VIPPS_CLIENT_ID: "id",
  VIPPS_CLIENT_SECRET: "secret",
  VIPPS_SUBSCRIPTION_KEY: "sub",
  VIPPS_MSN: "123456",
};

function fakeFetch(handler: (url: string, init?: RequestInit) => unknown) {
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const body = u.endsWith("/accesstoken/get") ? { access_token: "tok" } : handler(u, init);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe("vippsEnv", () => {
  it("is null until all four keys are set", () => {
    expect(vippsEnv({})).toBeNull();
    expect(vippsEnv({ ...KEYS, VIPPS_MSN: undefined })).toBeNull();
    expect(vippsEnv(KEYS)).not.toBeNull();
  });

  it("uses the test server unless prod is explicitly chosen", () => {
    expect(vippsEnv(KEYS)!.baseUrl).toBe("https://apitest.vipps.no");
    expect(vippsEnv({ ...KEYS, VIPPS_ENV: "production" })!.baseUrl).toBe("https://apitest.vipps.no");
    expect(vippsEnv({ ...KEYS, VIPPS_ENV: "prod" })!.baseUrl).toBe("https://api.vipps.no");
  });
});

describe("references and amounts", () => {
  it("makes valid, unique references", () => {
    const a = newReference();
    expect(isReference(a)).toBe(true);
    expect(a).not.toBe(newReference());
    expect(a.length).toBeLessThanOrEqual(50);
    expect(isReference("mh-../../x")).toBe(false);
    expect(isReference(undefined)).toBe(false);
  });

  it("converts kroner to øre", () => {
    expect(toOre(100)).toBe(10000);
    expect(toOre(25)).toBe(2500);
  });
});

describe("API calls", () => {
  const cfg = vippsEnv(KEYS)!;

  it("creates a payment in øre with a redirect flow and the reference as idempotency key", async () => {
    const f = fakeFetch(() => ({ redirectUrl: "https://vipps.example/pay" }));
    const r = await createPayment(cfg, { reference: "mh-ref", amountOre: 10000, description: "Medlemskap", returnUrl: "https://x/ret" }, f);
    expect(r.redirectUrl).toBe("https://vipps.example/pay");
    const call = (f as unknown as ReturnType<typeof vi.fn>).mock.calls.find((c) => String(c[0]).endsWith("/epayment/v1/payments"))!;
    const init = call[1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.amount).toEqual({ currency: "NOK", value: 10000 });
    expect(body.userFlow).toBe("WEB_REDIRECT");
    expect(body.reference).toBe("mh-ref");
    const h = init.headers as Record<string, string>;
    expect(h["Idempotency-Key"]).toBe("mh-ref");
    expect(h.Authorization).toBe("Bearer tok");
    expect(h["Merchant-Serial-Number"]).toBe("123456");
  });

  it("reads state and amounts from a payment", async () => {
    const f = fakeFetch(() => ({
      state: "AUTHORIZED",
      amount: { value: 10000 },
      aggregate: { authorizedAmount: { value: 10000 }, capturedAmount: { value: 0 } },
    }));
    expect(await getPayment(cfg, "mh-ref", f)).toEqual({ reference: "mh-ref", state: "AUTHORIZED", amount: 10000, authorized: 10000, captured: 0 });
  });

  it("captures with a stable idempotency key", async () => {
    const f = fakeFetch(() => ({}));
    await capturePayment(cfg, "mh-ref", 10000, f);
    const call = (f as unknown as ReturnType<typeof vi.fn>).mock.calls.find((c) => String(c[0]).endsWith("/capture"))!;
    expect((call[1] as RequestInit & { headers: Record<string, string> }).headers["Idempotency-Key"]).toBe("mh-ref-capture");
    expect(JSON.parse(String((call[1] as RequestInit).body))).toEqual({ modificationAmount: { currency: "NOK", value: 10000 } });
  });

  it("throws on an error response", async () => {
    const f = vi.fn(async (url: string | URL | Request) =>
      String(url).endsWith("/accesstoken/get")
        ? new Response(JSON.stringify({ access_token: "tok" }), { status: 200 })
        : new Response("nope", { status: 500 }),
    ) as unknown as typeof fetch;
    await expect(getPayment(cfg, "mh-ref", f)).rejects.toThrow();
  });
});

import { isDonationReference, newDonationReference, parseDonation } from "./vipps";

describe("gaver", () => {
  it("makes donation references that cannot be confused with membership references", () => {
    const g = newDonationReference();
    expect(isDonationReference(g)).toBe(true);
    expect(isReference(g)).toBe(false);
    expect(isDonationReference(newReference())).toBe(false);
  });

  it("accepts whole kroner between 10 and 100 000 only", () => {
    expect(parseDonation("250")).toBe(250);
    expect(parseDonation(" 10 ")).toBe(10);
    expect(parseDonation("100000")).toBe(100000);
    for (const bad of ["9", "0", "-5", "100001", "12.5", "1e3", "", "abc", null, 250]) expect(parseDonation(bad)).toBeNull();
  });
});
