import { describe, expect, it } from "vitest";
import { groupByEmail, recentlyRequested, renewalMessage } from "./renewal-email";

const person = (o: Partial<Parameters<typeof renewalMessage>[1][number]> = {}) => ({
  name: "Kari Nordmann",
  fee: 100,
  link: "https://x/bli-med/medlem/t1",
  expires: "2025-12-31",
  coverYear: 2027,
  ...o,
});

describe("renewalMessage", () => {
  it("asks one person to renew, with the fee, the year and their personal link", () => {
    const m = renewalMessage("Kari", [person()], true);
    expect(m.subject).toContain("Fornye medlemskapet");
    expect(m.text).toContain("Hei Kari!");
    expect(m.text).toContain("100 kr per år");
    expect(m.text).toContain("gjelder medlemskapet ut 2027");
    expect(m.text).toContain("https://x/bli-med/medlem/t1");
    expect(m.text).toContain("betaler enkelt med Vipps");
    expect(m.text).not.toContain("#595791");
  });

  it("falls back to the manual payment instructions without Vipps", () => {
    const m = renewalMessage("Kari", [person()], false);
    expect(m.text).toContain("#595791");
    expect(m.text).toContain("3207 31 01688");
  });

  it("lists every person of a family with their own amount and link, in one email", () => {
    const m = renewalMessage("Kari", [person(), person({ name: "Liv", fee: 25, link: "https://x/bli-med/medlem/t2" })], true);
    expect(m.text).toContain("- Kari Nordmann: 100 kr");
    expect(m.text).toContain("- Liv: 25 kr");
    expect(m.text).toContain("https://x/bli-med/medlem/t2");
  });

  it("tells people how to opt out", () => {
    expect(renewalMessage("K", [person()], true).text).toContain("Svar på denne e-posten");
  });
});

describe("groupByEmail", () => {
  it("groups people who share an address and ignores empty addresses", () => {
    const g = groupByEmail([{ email: "A@x.no", n: 1 }, { email: "a@x.no ", n: 2 }, { email: "b@x.no", n: 3 }, { email: "", n: 4 }]);
    expect(g.map((x) => x.map((y) => y.n))).toEqual([[1, 2], [3]]);
  });
});

describe("recentlyRequested", () => {
  it("blocks a repeat request within 14 days only", () => {
    expect(recentlyRequested(null, "2026-11-23")).toBe(false);
    expect(recentlyRequested("2026-11-20T10:00:00Z", "2026-11-23")).toBe(true);
    expect(recentlyRequested("2026-11-01T10:00:00Z", "2026-11-23")).toBe(false);
  });
});
