import { describe, expect, it } from "vitest";
import { checkExpenseCode, expenseAccessToken, hasExpenseAccess } from "./expense-access";

describe("checkExpenseCode", () => {
  it("accepts the right word regardless of case and spaces", () => {
    expect(checkExpenseCode(" Kirsebaer 24 ", "kirsebaer 24")).toBe(true);
  });
  it("rejects wrong, empty and non-string input", () => {
    expect(checkExpenseCode("feil", "kirsebaer 24")).toBe(false);
    expect(checkExpenseCode("", "kirsebaer 24")).toBe(false);
    expect(checkExpenseCode(undefined, "kirsebaer 24")).toBe(false);
  });
  it("is closed when no code (or a too short one) is configured", () => {
    expect(checkExpenseCode("", "")).toBe(false);
    expect(checkExpenseCode("abc", "abc")).toBe(false);
  });
});

describe("expense access cookie", () => {
  const token = expenseAccessToken("kirsebaer 24", "hemmelig-nokkel")!;
  it("opens the form only with the token made from the current code and key", () => {
    expect(hasExpenseAccess(token, "kirsebaer 24", "hemmelig-nokkel")).toBe(true);
    expect(hasExpenseAccess(token, "nytt ord 2027", "hemmelig-nokkel")).toBe(false);
    expect(hasExpenseAccess(token, "kirsebaer 24", "annen-nokkel")).toBe(false);
  });
  it("rejects a missing or forged cookie and stays closed without configuration", () => {
    expect(hasExpenseAccess(undefined, "kirsebaer 24", "hemmelig-nokkel")).toBe(false);
    expect(hasExpenseAccess("a".repeat(64), "kirsebaer 24", "hemmelig-nokkel")).toBe(false);
    expect(expenseAccessToken("", "hemmelig-nokkel")).toBeNull();
    expect(expenseAccessToken("kirsebaer 24", "")).toBeNull();
  });
});
