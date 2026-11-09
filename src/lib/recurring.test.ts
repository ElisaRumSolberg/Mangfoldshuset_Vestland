import { describe, expect, it } from "vitest";
import {
  heldSessions,
  isoWeek,
  programParticipants,
  programVolunteerHours,
  scheduledSessions,
  nextOccurrences,
  parseMenu,
  shortDate,
  sortUpcoming,
  timeText,
  whenText,
  type Program,
} from "./recurring";

function makeProgram(overrides: Partial<Program> = {}): Program {
  return {
    id: "p1",
    title: "Testtilbud",
    description: "",
    frequency: "weekly",
    weekday: 5, // fredag
    nth: null,
    start_time: null,
    end_time: null,
    start_date: null,
    end_date: null,
    place: "Et sted",
    note: null,
    contact: null,
    responsible_name: null,
    responsible_phone: null,
    external_link: null,
    image_url: null,
    skipped_dates: [],
    active: true,
    featured: false,
    participants: null,
    summary: null,
    feedback: null,
    photos: [],
    sort_order: 0,
    show_on_homepage: false,
    homepage_image_urls: [],
    highlights: null,
    price: null,
    menu: null,
    avg_participants: null,
    weeks_per_year: 32,
    volunteers_per_session: null,
    hours_per_volunteer: null,
    menu_image_url: null,
    menu_image_week: null,
    registration_open: false,
    ...overrides,
  };
}

describe("nextOccurrences – weekly", () => {
  it("finds the next matching weekday", () => {
    // 2026-09-28 er en mandag; neste fredag (weekday 5) er 2026-10-02
    const p = makeProgram({ frequency: "weekly", weekday: 5 });
    expect(nextOccurrences(p, "2026-09-28", 1)).toEqual(["2026-10-02"]);
  });

  it("includes the start date itself if it matches", () => {
    const p = makeProgram({ frequency: "weekly", weekday: 1 }); // mandag
    expect(nextOccurrences(p, "2026-09-28", 1)).toEqual(["2026-09-28"]);
  });

  it("skips dates listed in skipped_dates", () => {
    const p = makeProgram({ frequency: "weekly", weekday: 5, skipped_dates: ["2026-10-02"] });
    expect(nextOccurrences(p, "2026-09-28", 1)).toEqual(["2026-10-09"]);
  });

  it("respects start_date and end_date bounds", () => {
    const p = makeProgram({
      frequency: "weekly",
      weekday: 5,
      start_date: "2026-10-09",
      end_date: "2026-10-09",
    });
    expect(nextOccurrences(p, "2026-09-28", 3)).toEqual(["2026-10-09"]);
  });

  it("returns an empty array when nothing matches within the horizon", () => {
    const p = makeProgram({ frequency: "weekly", weekday: 5, end_date: "2026-09-01" });
    expect(nextOccurrences(p, "2026-09-28", 1)).toEqual([]);
  });
});

describe("nextOccurrences – monthly", () => {
  it("finds the nth weekday of the month", () => {
    // Oktober 2026: fredager er 2, 9, 16, 23, 30. Andre fredag = 9. okt.
    const p = makeProgram({ frequency: "monthly", weekday: 5, nth: 2 });
    expect(nextOccurrences(p, "2026-10-01", 1)).toEqual(["2026-10-09"]);
  });

  it("finds the LAST weekday of the month (nth: -1)", () => {
    // Siste fredag i oktober 2026 er 30. okt.
    const p = makeProgram({ frequency: "monthly", weekday: 5, nth: -1 });
    expect(nextOccurrences(p, "2026-10-01", 1)).toEqual(["2026-10-30"]);
  });

  it("does not match a non-last occurrence when nth is -1", () => {
    const p = makeProgram({ frequency: "monthly", weekday: 5, nth: -1 });
    const occurrences = nextOccurrences(p, "2026-10-01", 1, 40);
    expect(occurrences).not.toContain("2026-10-02");
    expect(occurrences).not.toContain("2026-10-09");
  });
});

describe("timeText", () => {
  it("returns null when no start_time is set", () => {
    expect(timeText(makeProgram())).toBeNull();
  });

  it("formats a start-only time", () => {
    expect(timeText(makeProgram({ start_time: "19:00:00" }))).toBe("kl. 19.00");
  });

  it("formats a start–end range", () => {
    expect(timeText(makeProgram({ start_time: "19:00:00", end_time: "20:30:00" }))).toBe(
      "kl. 19.00–20.30"
    );
  });
});

describe("whenText", () => {
  it("describes a weekly program", () => {
    expect(whenText(makeProgram({ frequency: "weekly", weekday: 5 }))).toBe("Hver fredag");
  });

  it("describes a monthly program with an ordinal", () => {
    expect(whenText(makeProgram({ frequency: "monthly", weekday: 0, nth: -1 }))).toBe(
      "Siste søndag i måneden"
    );
  });
});

describe("shortDate", () => {
  it("formats an ISO date in Norwegian, unaffected by local timezone", () => {
    // 2026-10-02 er en fredag
    expect(shortDate("2026-10-02")).toMatch(/fre\.?\s*2\.\s*okt\.?/i);
  });
});

describe("sortUpcoming", () => {
  it("puts featured items first, then single events, then recurring, each sorted by date", () => {
    const items = [
      { iso: "2026-10-05", label: "recurring-later", recurring: true },
      { iso: "2026-10-01", label: "single" },
      { iso: "2026-10-03", label: "recurring-earlier", recurring: true },
      { iso: "2026-10-10", label: "featured", featured: true },
    ];
    const order = sortUpcoming(items).map((i) => i.label);
    expect(order).toEqual(["featured", "single", "recurring-earlier", "recurring-later"]);
  });
});

describe("ukemeny", () => {
  it("regner ISO-uke for torsdager", () => {
    expect(isoWeek("2026-11-05")).toBe(45);
    expect(isoWeek("2026-11-12")).toBe(46);
    expect(isoWeek("2026-12-31")).toBe(53);
    expect(isoWeek("2027-01-07")).toBe(1);
  });

  it("leser én rett per linje med ingredienser", () => {
    const menu = parseMenu(
      ["45: Linsesuppe – røde linser, gulrot, løk", "Uke 46 - Tomatsuppe", "rot", "99: for høy uke"].join("\n")
    );
    expect(menu).toEqual([
      { week: 45, name: "Linsesuppe", ingredients: "røde linser, gulrot, løk" },
      { week: 46, name: "Tomatsuppe", ingredients: null },
    ]);
    expect(parseMenu(null)).toEqual([]);
  });
});

describe("automatiske tall for faste tilbud", () => {
  const weekly = (o: Partial<Program> = {}) =>
    makeProgram({ frequency: "weekly", weekday: 4, start_date: "2026-10-01", ...o });

  it("counts the scheduled Thursdays from the first date up to today", () => {
    // torsdager 1., 8., 15., 22., 29. oktober og 5. november
    expect(scheduledSessions(weekly(), "2026-11-05")).toBe(6);
    expect(scheduledSessions(weekly(), "2026-09-30")).toBe(0);
    expect(scheduledSessions(weekly({ start_date: null }), "2026-11-05")).toBe(0);
  });

  it("skips cancelled dates and stops at the end date", () => {
    expect(scheduledSessions(weekly({ skipped_dates: ["2026-10-15"] }), "2026-11-05")).toBe(5);
    expect(scheduledSessions(weekly({ end_date: "2026-10-15" }), "2026-11-05")).toBe(3);
  });

  it("scales weekly sessions with the weeks per year, but not monthly ones", () => {
    const p = weekly({ start_date: "2025-01-02", weeks_per_year: 26 });
    const scheduled = scheduledSessions(p, "2025-12-31");
    expect(heldSessions(p, "2025-12-31")).toBe(Math.round(scheduled / 2));
    const monthly = makeProgram({ frequency: "monthly", weekday: 0, nth: -1, start_date: "2026-01-01", weeks_per_year: 20 });
    expect(heldSessions(monthly, "2026-06-30")).toBe(scheduledSessions(monthly, "2026-06-30"));
  });

  it("computes participants so far automatically when average and first date are set", () => {
    const p = weekly({ avg_participants: 13, start_date: "2023-10-05", weeks_per_year: 32 });
    const r = programParticipants(p, "2026-11-05");
    expect(r.auto).toBe(true);
    expect(r.value).toBe(heldSessions(p, "2026-11-05") * 13);
    expect(r.value).toBeGreaterThan(1000);
    expect(r.value).toBeLessThan(1700);
  });

  it("falls back to the typed total when there is no average", () => {
    expect(programParticipants(weekly({ participants: 250 }), "2026-11-05")).toEqual({ value: 250, auto: false });
    expect(programParticipants(weekly({ avg_participants: 10, start_date: null, participants: 7 }), "2026-11-05")).toEqual({ value: 7, auto: false });
  });

  it("computes volunteer hours from sessions, volunteers and hours each", () => {
    const p = weekly({ volunteers_per_session: 3, hours_per_volunteer: 4, weeks_per_year: 52 });
    expect(programVolunteerHours(p, "2026-11-05")).toBe(6 * 3 * 4);
    expect(programVolunteerHours(weekly({ volunteers_per_session: 3 }), "2026-11-05")).toBe(0);
  });
});
