import { describe, expect, it } from "vitest";
import { filterVolunteers, splitList, volunteerFromApplication, volunteersCsv, type ApplicationRow, type Volunteer } from "./volunteers";

const v = (o: Partial<Volunteer>): Volunteer => ({
  id: "1",
  name: "Kari Nordmann",
  email: "kari@example.invalid",
  phone: "12345678",
  interests: ["Mat og servering"],
  availability: ["Hverdager på kveldstid"],
  programs: "Torsdagssuppe",
  status: "aktiv",
  note: null,
  application_id: null,
  created_at: "2026-11-18T10:00:00Z",
  ...o,
});

describe("volunteerFromApplication", () => {
  it("maps the volunteer form fields onto a register card", () => {
    const app: ApplicationRow = {
      id: "a1",
      type: "frivillig",
      name: "Ali Test",
      email: "ali@example.invalid",
      phone: "99999999",
      created_at: "2026-11-01T10:00:00Z",
      data: {
        interesser: ["Barn og unge", "Kultur"],
        tilgjengelighet: "Helger",
        type_bidrag: "Jeg ønsker å bidra regelmessig",
        ferdigheter: "Kan lage mat og spille gitar",
      },
    };
    expect(volunteerFromApplication(app)).toEqual({
      name: "Ali Test",
      email: "ali@example.invalid",
      phone: "99999999",
      interests: ["Barn og unge", "Kultur"],
      availability: ["Helger"],
      programs: null,
      status: "ny",
      note: "Ønsker: Jeg ønsker å bidra regelmessig\nFerdigheter: Kan lage mat og spille gitar",
      application_id: "a1",
    });
  });

  it("copes with a bare application", () => {
    const r = volunteerFromApplication({ id: "a2", type: "frivillig", name: "X", email: "", phone: null, data: {}, created_at: "" });
    expect(r).toMatchObject({ email: null, phone: null, interests: [], availability: [], note: null });
  });
});

describe("filterVolunteers", () => {
  const rows = [v({ id: "1" }), v({ id: "2", name: "Ola", email: "ola@example.invalid", status: "pause", programs: "Leksehjelp", interests: ["Barn og unge"] })];
  it("filters on status", () => {
    expect(filterVolunteers(rows, "", "pause").map((x) => x.id)).toEqual(["2"]);
    expect(filterVolunteers(rows, "", "alle")).toHaveLength(2);
  });
  it("searches name, programme and interests, ignoring case", () => {
    expect(filterVolunteers(rows, "LEKSE", "").map((x) => x.id)).toEqual(["2"]);
    expect(filterVolunteers(rows, "kari", "").map((x) => x.id)).toEqual(["1"]);
    expect(filterVolunteers(rows, "barn", "").map((x) => x.id)).toEqual(["2"]);
  });
});

describe("splitList and csv", () => {
  it("splits on commas, semicolons and newlines, without duplicates", () => {
    expect(splitList("Mat, Kultur;Mat\nSpråk ")).toEqual(["Mat", "Kultur", "Språk"]);
    expect(splitList(null)).toEqual([]);
  });
  it("writes a semicolon CSV with BOM and neutralises spreadsheet formulas", () => {
    const csv = volunteersCsv([v({ name: "=HYPERLINK(\"x\")", note: "Linje 1\nLinje 2" })]);
    expect(csv.startsWith("﻿Navn;E-post")).toBe(true);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('"Linje 1\nLinje 2"');
  });
});
