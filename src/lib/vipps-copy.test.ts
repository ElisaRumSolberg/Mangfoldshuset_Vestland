import { afterEach, describe, expect, it, vi } from "vitest";
import { existingMemberMessage } from "./receipt-email";
import { unpaidMessage } from "./unpaid-reminders";

const KEYS = { VIPPS_CLIENT_ID: "a", VIPPS_CLIENT_SECRET: "b", VIPPS_SUBSCRIPTION_KEY: "c", VIPPS_MSN: "1" };
afterEach(() => vi.unstubAllEnvs());

describe("e-poster viser direkte Vipps-betaling når Vipps er satt opp", () => {
  it("falls back to the manual instructions without Vipps keys", () => {
    const m = unpaidMessage("Kari", [{ name: "Kari", fee: 100, link: "https://x/medlem/t" }]);
    expect(m.text).toContain("#595791");
  });

  it("points to the member page instead of the old number when Vipps is configured", () => {
    for (const [k, v] of Object.entries({ ...KEYS, VIPPS_ENV: "prod" })) vi.stubEnv(k, v);
    const unpaid = unpaidMessage("Kari", [{ name: "Kari", fee: 100, link: "https://x/medlem/t" }]);
    expect(unpaid.text).not.toContain("#595791");
    expect(unpaid.text).toContain("direkte på medlemssiden");
    expect(unpaid.text).toContain("https://x/medlem/t");

    const again = existingMemberMessage({ first_name: "K", expires_at: null, pay_token: "t" }, 100, "2027-02-01", "https://x");
    expect(again.text).not.toContain("#595791");
    expect(again.text).toContain("direkte på medlemssiden");
    expect(again.text).toContain("https://x/bli-med/medlem/t");
  });
});
