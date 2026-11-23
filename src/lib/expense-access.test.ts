import { describe, expect, it } from "vitest";
import { checkExpenseCode } from "./expense-access";

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
