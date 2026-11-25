import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Fellesordet (miljøvariabelen EXPENSE_CODE) som gir frivillige uten admin-konto tilgang til utleggsskjemaet. */
export function expenseCodeConfigured(): boolean {
  return (process.env.EXPENSE_CODE ?? "").trim().length >= 6;
}

/** Sammenligner uten å lekke hvor mye av ordet som stemte. Tom eller for kort kode gir alltid «nei». */
export function checkExpenseCode(input: unknown, expected = process.env.EXPENSE_CODE ?? ""): boolean {
  const want = expected.trim();
  if (want.length < 6 || typeof input !== "string") return false;
  const a = createHash("sha256").update(input.trim().toLowerCase()).digest();
  const b = createHash("sha256").update(want.toLowerCase()).digest();
  return timingSafeEqual(a, b);
}

export const EXPENSE_COOKIE = "utlegg_tilgang";

/** Verdien i informasjonskapselen etter riktig fellesord. Endres ordet (eller nøkkelen), slutter gamle kapsler å virke. */
export function expenseAccessToken(
  code = process.env.EXPENSE_CODE ?? "",
  key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
): string | null {
  const word = code.trim().toLowerCase();
  if (word.length < 6 || !key) return null;
  return createHmac("sha256", key).update(`utlegg:${word}`).digest("hex");
}

export function hasExpenseAccess(
  cookie: string | undefined,
  code = process.env.EXPENSE_CODE ?? "",
  key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
): boolean {
  const want = expenseAccessToken(code, key);
  if (!want || !cookie || cookie.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(cookie), Buffer.from(want));
}
