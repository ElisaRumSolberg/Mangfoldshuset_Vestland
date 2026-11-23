import { createHash, timingSafeEqual } from "node:crypto";

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
