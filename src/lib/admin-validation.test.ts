import { describe, expect, it } from "vitest";
import { checkActivity, checkMember, checkProgram, checkStats } from "./admin-validation";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

const activity = {
  title: "Familiebrunsj",
  event_date: "2026-11-29",
  end_date: "",
  place: "Holen skole",
  description: "Brunsj for hele familien",
  responsible_email: "",
};

describe("checkActivity", () => {
  it("accepts a normal activity, with or without the optional fields", () => {
    expect(checkActivity(form(activity))).toBeNull();
    expect(
      checkActivity(form({ ...activity, end_date: "2026-11-30", responsible_email: "a@b.no", participants: "0", volunteer_hours: "12" })),
    ).toBeNull();
  });
  it.each([
    [{ title: "   " }, "mangler-felt"],
    [{ place: "" }, "mangler-felt"],
    [{ description: "" }, "mangler-felt"],
    [{ event_date: "" }, "ugyldig-dato-felt"],
    [{ event_date: "29.11.2026" }, "ugyldig-dato-felt"],
    [{ event_date: "2026-02-30" }, "ugyldig-dato-felt"],
    [{ end_date: "2026-11-28" }, "slutt-for-start"],
    [{ responsible_email: "ikke-en-adresse" }, "ugyldig-epost"],
    [{ participants: "-1" }, "ugyldig-tall"],
    [{ participants: "ti" }, "ugyldig-tall"],
    [{ volunteer_hours: "1.5" }, "ugyldig-tall"],
  ])("rejects %j", (change, code) => {
    expect(checkActivity(form({ ...activity, ...change } as Record<string, string>))).toBe(code);
  });
});

const program = {
  title: "Torsdagssuppe",
  place: "Arne Abrahamsens vei 1",
  weekday: "4",
  start_time: "13:30",
  end_time: "15:00",
  start_date: "2026-09-03",
  end_date: "",
  skipped_dates: "2026-12-24, 2026-12-31",
  contact: "",
  weeks_per_year: "32",
};

describe("checkProgram", () => {
  it("accepts the shape of the programmes already in use", () => {
    expect(checkProgram(form(program))).toBeNull();
    expect(checkProgram(form({ ...program, start_time: "", end_time: "", skipped_dates: "", weeks_per_year: "", hours_per_volunteer: "2,5" }))).toBeNull();
    expect(checkProgram(form({ ...program, start_time: "13:30:00", end_time: "15:00:00", skipped_dates: "2026-12-11 2026-12-18," }))).toBeNull();
  });
  it.each([
    [{ title: "" }, "mangler-felt"],
    [{ place: " " }, "mangler-felt"],
    [{ weekday: "9" }, "generell"],
    [{ end_time: "13:00" }, "slutt-for-start"],
    [{ end_date: "2026-09-01" }, "slutt-for-start"],
    [{ start_date: "september" }, "ugyldig-dato-felt"],
    [{ skipped_dates: "24.12.2026" }, "ugyldig-avlyst-dato"],
    [{ skipped_dates: "2026-12-24, 2026-13-01" }, "ugyldig-avlyst-dato"],
    [{ contact: "serap" }, "ugyldig-epost"],
    [{ avg_participants: "-3" }, "ugyldig-tall"],
    [{ weeks_per_year: "60" }, "ugyldig-tall"],
    [{ hours_per_volunteer: "30" }, "ugyldig-tall"],
    [{ menu_image_week: "54" }, "ugyldig-tall"],
  ])("rejects %j", (change, code) => {
    expect(checkProgram(form({ ...program, ...change } as Record<string, string>))).toBe(code);
  });
});

const member = { first_name: "Kari", last_name: "Nordmann", email: "kari@eksempel.no", birth_date: "" };
const today = "2026-11-27";

describe("checkMember", () => {
  it("accepts a member with and without optional dates", () => {
    expect(checkMember(form(member), today)).toBeNull();
    expect(checkMember(form({ ...member, birth_date: today, expires_at: "2027-12-31", fam_birth_1: "2015-04-01" }), today)).toBeNull();
  });
  it.each([
    [{ first_name: "" }, "mangler-felt"],
    [{ email: "" }, "mangler-felt"],
    [{ email: "kari@" }, "ugyldig-epost"],
    [{ birth_date: "2026-11-28" }, "ugyldig-fodselsdato"],
    [{ fam_birth_2: "2030-01-01" }, "ugyldig-fodselsdato"],
    [{ expires_at: "31.12.2026" }, "ugyldig-dato-felt"],
  ])("rejects %j", (change, code) => {
    expect(checkMember(form({ ...member, ...change } as Record<string, string>), today)).toBe(code);
  });
});

describe("checkStats", () => {
  it("accepts whole numbers from zero, and empty as zero", () => {
    expect(checkStats(form({ participants: "0", volunteer_hours: "250" }))).toBeNull();
    expect(checkStats(form({ participants: "", volunteer_hours: "" }))).toBeNull();
  });
  it.each(["-5", "1.5", "abc"])("rejects %s", (value) => {
    expect(checkStats(form({ participants: value, volunteer_hours: "1" }))).toBe("ugyldig-tall");
  });
});
