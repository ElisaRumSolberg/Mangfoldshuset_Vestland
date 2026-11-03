import { describe, expect, it } from "vitest";
import { ageOn, feeForPerson, feeText, membershipFee } from "./membership-fee";

describe("ageOn", () => {
  it("counts whole years and respects the birthday", () => {
    expect(ageOn("2010-11-05", "2026-11-04")).toBe(15);
    expect(ageOn("2010-11-05", "2026-11-05")).toBe(16);
    expect(ageOn("2000-02-29", "2026-02-28")).toBe(25);
  });
});

describe("feeForPerson", () => {
  it("charges 25 kr up to and including age 15 and 100 kr from 16", () => {
    expect(feeForPerson("2011-01-02", "2026-11-03")).toBe(25); // 15 år
    expect(feeForPerson("2010-11-03", "2026-11-03")).toBe(100); // fyller 16 i dag
    expect(feeForPerson("2020-05-05", "2026-11-03")).toBe(25);
  });
  it("treats a missing or invalid birth date as an adult", () => {
    expect(feeForPerson(null, "2026-11-03")).toBe(100);
    expect(feeForPerson("ukjent", "2026-11-03")).toBe(100);
  });
  it("lets a child turn 16 between two renewals", () => {
    expect(feeForPerson("2010-12-20", "2026-11-03")).toBe(25);
    expect(feeForPerson("2010-12-20", "2027-01-01")).toBe(100);
  });
});

describe("membershipFee", () => {
  it("adds up a household per person", () => {
    const fee = membershipFee(
      [{ birth_date: "1985-03-03" }, { birth_date: "1987-07-07" }, { birth_date: "2015-01-01" }],
      "2026-11-03",
    );
    expect(fee).toEqual({ total: 225, adults: 2, children: 1 });
    expect(feeText(fee)).toBe("225 kr (2 × 100 kr + 1 × 25 kr)");
  });
  it("shows a single person as a plain amount", () => {
    expect(feeText(membershipFee([{ birth_date: "1990-01-01" }], "2026-11-03"))).toBe("100 kr");
    expect(feeText(membershipFee([{ birth_date: "2018-01-01" }], "2026-11-03"))).toBe("25 kr");
  });
});
