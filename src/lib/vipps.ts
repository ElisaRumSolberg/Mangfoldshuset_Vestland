/**
 * Vipps MobilePay ePayment API (https://developer.vippsmobilepay.com/docs/APIs/epayment-api/).
 * Ren fetch, ingen ekstra pakker. Alle hemmeligheter kommer fra miljøvariabler (Vercel, «Sensitive»).
 * Er de ikke satt, er `isVippsConfigured()` false og nettsiden viser bare de manuelle betalingsmåtene.
 */

export type VippsEnv = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  subscriptionKey: string;
  msn: string;
};

export type VippsState = "CREATED" | "AUTHORIZED" | "ABORTED" | "EXPIRED" | "TERMINATED";

export type VippsPayment = {
  reference: string;
  state: VippsState;
  amount: number; // øre
  authorized: number; // øre
  captured: number; // øre
};

type FetchLike = typeof fetch;

const BASE = { test: "https://apitest.vipps.no", prod: "https://api.vipps.no" } as const;

export function vippsEnv(env: Record<string, string | undefined> = process.env): VippsEnv | null {
  const { VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN } = env;
  if (!VIPPS_CLIENT_ID || !VIPPS_CLIENT_SECRET || !VIPPS_SUBSCRIPTION_KEY || !VIPPS_MSN) return null;
  // Uten uttrykkelig «prod» brukes testmiljøet, så ingen kan belaste ekte kort ved en feil.
  const baseUrl = env.VIPPS_ENV === "prod" ? BASE.prod : BASE.test;
  return { baseUrl, clientId: VIPPS_CLIENT_ID, clientSecret: VIPPS_CLIENT_SECRET, subscriptionKey: VIPPS_SUBSCRIPTION_KEY, msn: VIPPS_MSN };
}

export function isVippsConfigured(): boolean {
  return vippsEnv() !== null;
}

/** Referansen må være unik per salgsenhet. «mh-» + uuid er 39 tegn (bokstaver, tall og bindestrek). */
export function newReference(): string {
  return `mh-${crypto.randomUUID()}`;
}

export function isReference(v: unknown): v is string {
  return typeof v === "string" && /^mh-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

/** Referanse for en gave. Egen prefiks, så gaver og medlemsbetalinger aldri forveksles. */
export function newDonationReference(): string {
  return `gv-${crypto.randomUUID()}`;
}

export function isDonationReference(v: unknown): v is string {
  return typeof v === "string" && /^gv-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

/** Gave: minst 10 kr og høyst 100 000 kr, hele kroner. */
export const DONATION_MIN = 10;
export const DONATION_MAX = 100000;

export function parseDonation(v: unknown): number | null {
  if (typeof v !== "string" || !/^\d{1,6}$/.test(v.trim())) return null;
  const n = Number(v.trim());
  return n >= DONATION_MIN && n <= DONATION_MAX ? n : null;
}

export function toOre(kroner: number): number {
  return Math.round(kroner * 100);
}

function headers(cfg: VippsEnv, token: string, extra: Record<string, string> = {}) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "Ocp-Apim-Subscription-Key": cfg.subscriptionKey,
    "Merchant-Serial-Number": cfg.msn,
    "Vipps-System-Name": "mangfoldshuset-vestland",
    "Vipps-System-Version": "1",
    ...extra,
  };
}

export class VippsError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

export async function getAccessToken(cfg: VippsEnv, f: FetchLike = fetch): Promise<string> {
  const res = await f(`${cfg.baseUrl}/accesstoken/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      "Ocp-Apim-Subscription-Key": cfg.subscriptionKey,
      "Merchant-Serial-Number": cfg.msn,
    },
    body: "",
  });
  if (!res.ok) throw new VippsError("Kunne ikke hente tilgangstoken fra Vipps", res.status);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new VippsError("Vipps ga ikke et tilgangstoken");
  return json.access_token;
}

export async function createPayment(
  cfg: VippsEnv,
  input: { reference: string; amountOre: number; description: string; returnUrl: string },
  f: FetchLike = fetch,
): Promise<{ redirectUrl: string }> {
  const token = await getAccessToken(cfg, f);
  const res = await f(`${cfg.baseUrl}/epayment/v1/payments`, {
    method: "POST",
    headers: headers(cfg, token, { "Idempotency-Key": input.reference }),
    body: JSON.stringify({
      amount: { currency: "NOK", value: input.amountOre },
      paymentMethod: { type: "WALLET" },
      reference: input.reference,
      paymentDescription: input.description.slice(0, 100),
      returnUrl: input.returnUrl,
      userFlow: "WEB_REDIRECT",
    }),
  });
  if (!res.ok) throw new VippsError("Kunne ikke opprette betalingen hos Vipps", res.status);
  const json = (await res.json()) as { redirectUrl?: string };
  if (!json.redirectUrl) throw new VippsError("Vipps ga ingen betalingslenke");
  return { redirectUrl: json.redirectUrl };
}

export async function getPayment(cfg: VippsEnv, reference: string, f: FetchLike = fetch): Promise<VippsPayment> {
  const token = await getAccessToken(cfg, f);
  const res = await f(`${cfg.baseUrl}/epayment/v1/payments/${encodeURIComponent(reference)}`, {
    headers: headers(cfg, token),
  });
  if (!res.ok) throw new VippsError("Kunne ikke hente betalingen fra Vipps", res.status);
  const j = (await res.json()) as {
    state: VippsState;
    amount?: { value: number };
    aggregate?: { authorizedAmount?: { value: number }; capturedAmount?: { value: number } };
  };
  return {
    reference,
    state: j.state,
    amount: j.amount?.value ?? 0,
    authorized: j.aggregate?.authorizedAmount?.value ?? 0,
    captured: j.aggregate?.capturedAmount?.value ?? 0,
  };
}

/** Trekker pengene. Idempotency-Key gjør at samme capture aldri trekker to ganger. */
export async function capturePayment(
  cfg: VippsEnv,
  reference: string,
  amountOre: number,
  f: FetchLike = fetch,
): Promise<void> {
  const token = await getAccessToken(cfg, f);
  const res = await f(`${cfg.baseUrl}/epayment/v1/payments/${encodeURIComponent(reference)}/capture`, {
    method: "POST",
    headers: headers(cfg, token, { "Idempotency-Key": `${reference}-capture` }),
    body: JSON.stringify({ modificationAmount: { currency: "NOK", value: amountOre } }),
  });
  if (!res.ok) throw new VippsError("Kunne ikke trekke betalingen hos Vipps", res.status);
}
