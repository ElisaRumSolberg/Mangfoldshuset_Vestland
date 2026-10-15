import { describe, expect, it } from "vitest";
import { UNPAID_BASE, lastSentMilestone, nextUnpaidMilestone, unpaidMessage } from "./unpaid-reminders";

describe("nextUnpaidMilestone", () => {
  it("waits until day 3", () => {
    expect(nextUnpaidMilestone(0, null)).toBeNull();
    expect(nextUnpaidMilestone(2, null)).toBeNull();
  });
  it("sends day 3, then day 14, then stops", () => {
    expect(nextUnpaidMilestone(3, null)).toBe(3);
    expect(nextUnpaidMilestone(5, UNPAID_BASE + 3)).toBeNull();
    expect(nextUnpaidMilestone(14, UNPAID_BASE + 3)).toBe(14);
    expect(nextUnpaidMilestone(20, UNPAID_BASE + 14)).toBeNull();
  });
  it("sends only one per run even if both are overdue", () => {
    expect(nextUnpaidMilestone(20, null)).toBe(3);
  });
  it("ignores values from the expiry reminders", () => {
    expect(lastSentMilestone(10)).toBe(0);
    expect(lastSentMilestone(-3)).toBe(0);
    expect(lastSentMilestone(null)).toBe(0);
  });
});

describe("unpaidMessage", () => {
  it("states the right amount per membership type", () => {
    expect(unpaidMessage("Kari", "enkelt").text).toContain("100 kr");
    expect(unpaidMessage("Kari", "familie").text).toContain("150 kr");
  });
});
