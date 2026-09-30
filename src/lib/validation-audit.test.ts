import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { familyMembersSchema, membershipSchema, contactSchema } from "./validation";
const member = { first_name: "QA Ø", last_name: "Test", email: "QA@example.invalid", membership_type: "enkelt" };
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-30T12:00:00Z")); });
afterEach(() => vi.useRealTimers());
it.each(["2026-02-30", "tomorrow", "2027-01-01"])("rejects invalid/future birth date %s", birth_date => {
  expect(membershipSchema.safeParse({ ...member, birth_date }).success).toBe(false);
});
it("requires guardian for a minor but accepts an adult", () => {
  expect(membershipSchema.safeParse({ ...member, birth_date: "2015-01-01" }).success).toBe(false);
  expect(membershipSchema.safeParse({ ...member, birth_date: "2015-01-01", guardian: "QA Adult" }).success).toBe(true);
  expect(membershipSchema.safeParse({ ...member, birth_date: "2008-09-30" }).success).toBe(true);
});
it("limits family data and validates dates", () => {
  expect(familyMembersSchema.safeParse([{ name: "x".repeat(201) }]).success).toBe(false);
  expect(familyMembersSchema.safeParse([{ name: "QA", birth_date: "2026-02-30" }]).success).toBe(false);
  expect(familyMembersSchema.safeParse(Array.from({ length: 6 }, () => ({ name: "QA" }))).success).toBe(false);
});
it("normalizes email and preserves Unicode names", () => {
  expect(membershipSchema.parse(member).email).toBe("qa@example.invalid");
  expect(membershipSchema.parse(member).first_name).toBe("QA Ø");
});
it("rejects alphabetic phone and long content", () => {
  expect(membershipSchema.safeParse({ ...member, phone: "not a phone" }).success).toBe(false);
  expect(contactSchema.safeParse({ name: "QA", email: member.email, subject: "QA", message: "x".repeat(5001) }).success).toBe(false);
});
