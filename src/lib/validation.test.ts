import { describe, expect, it } from "vitest";
import {
  activitySignupSchema,
  applicationSchema,
  contactSchema,
  membershipSchema,
} from "./validation";

describe("contactSchema", () => {
  const valid = {
    name: "Kari Nordmann",
    email: "kari@example.com",
    subject: "Spørsmål",
    message: "Hei, jeg lurer på noe.",
  };

  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email address", () => {
    const result = contactSchema.safeParse({ ...valid, email: "ikke-en-epost" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the length limit", () => {
    const result = contactSchema.safeParse({ ...valid, message: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("trims surrounding whitespace", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  Kari Nordmann  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Kari Nordmann");
  });
});

describe("membershipSchema", () => {
  const valid = {
    first_name: "Kari",
    last_name: "Nordmann",
    email: "kari@example.com",
    membership_type: "enkelt",
  };

  it("accepts a minimal valid submission", () => {
    expect(membershipSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid membership_type", () => {
    const result = membershipSchema.safeParse({ ...valid, membership_type: "gratis" });
    expect(result.success).toBe(false);
  });

  it("allows empty optional fields", () => {
    const result = membershipSchema.safeParse({ ...valid, phone: "", address: "" });
    expect(result.success).toBe(true);
  });
});

describe("applicationSchema", () => {
  it("only accepts known application types", () => {
    const base = { name: "Kari", email: "kari@example.com", phone: "" };
    expect(applicationSchema.safeParse({ ...base, type: "frivillig" }).success).toBe(true);
    expect(applicationSchema.safeParse({ ...base, type: "hacker" }).success).toBe(false);
  });
});

describe("activitySignupSchema", () => {
  const valid = { name: "Kari", email: "kari@example.com", phone: "", participants: "2", comment: "" };

  it("coerces participants to a number", () => {
    const result = activitySignupSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.participants).toBe(2);
  });

  it("rejects zero or negative participants", () => {
    expect(activitySignupSchema.safeParse({ ...valid, participants: "0" }).success).toBe(false);
    expect(activitySignupSchema.safeParse({ ...valid, participants: "-1" }).success).toBe(false);
  });

  it("rejects more than 50 participants", () => {
    expect(activitySignupSchema.safeParse({ ...valid, participants: "51" }).success).toBe(false);
  });
});
