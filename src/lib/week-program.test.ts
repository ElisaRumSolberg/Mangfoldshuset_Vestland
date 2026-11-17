import { describe, expect, it } from "vitest";
import type { Program } from "./recurring";
import { addDaysIso, buildWeek, mondayOf, parseWeekParam, shortPlace } from "./week-program";

function prog(o: Partial<Program>): Program {
  return {
    id: "p",
    title: "Tilbud",
    description: "",
    frequency: "weekly",
    weekday: 1,
    nth: null,
    start_time: null,
    end_time: null,
    start_date: null,
    end_date: null,
    place: "Mangfoldhuset, Arne Abrahamsens vei 1, Bergen",
    skipped_dates: [],
    active: true,
    ...o,
  } as Program;
}

describe("shortPlace", () => {
  it("drops the repeated street address but keeps useful hints", () => {
    expect(shortPlace("Mangfoldhuset, Arne Abrahamsens vei 1, Bergen")).toBe("Mangfoldhuset");
    expect(shortPlace("Storstua, Melkeplassen, Arne Abrahamsens vei 1, Bergen")).toBe("Storstua, Melkeplassen");
    expect(shortPlace("Mangfoldhuset, Arne Abrahamsens vei 1, 5161 Laksevåg (bak Coop Prix Melkeplassen)")).toBe("Mangfoldhuset (bak Coop Prix Melkeplassen)");
    expect(shortPlace("Holen skole, Øvre Holen 6, 5163 Laksevåg")).toBe("Holen skole, Øvre Holen 6, 5163 Laksevåg");
    expect(shortPlace("")).toBeNull();
  });
});

// Uke 47 2026: mandag 16. – søndag 22. november
describe("uke", () => {
  it("finds the Monday of the ISO week", () => {
    expect(mondayOf("2026-11-16")).toBe("2026-11-16");
    expect(mondayOf("2026-11-22")).toBe("2026-11-16");
    expect(mondayOf("2026-11-18")).toBe("2026-11-16");
    expect(addDaysIso("2026-11-16", 6)).toBe("2026-11-22");
  });

  it("falls back to this week for bad input and limits how far one can browse", () => {
    expect(parseWeekParam(undefined, "2026-11-18")).toBe("2026-11-16");
    expect(parseWeekParam("abc", "2026-11-18")).toBe("2026-11-16");
    expect(parseWeekParam("2026-99-99", "2026-11-18")).toBe("2026-11-16");
    expect(parseWeekParam("2026-11-26", "2026-11-18")).toBe("2026-11-23");
    expect(parseWeekParam("2030-01-01", "2026-11-18")).toBe("2026-11-16");
  });
});

describe("buildWeek", () => {
  it("lists weekly programs on their weekday, earliest first, with times", () => {
    const week = buildWeek(
      [
        prog({ id: "a", title: "Språkkafé", weekday: 2, start_time: "18:00:00", end_time: "19:30:00" }),
        prog({ id: "b", title: "Leksehjelp", weekday: 2, start_time: "16:30:00", end_time: "18:00:00" }),
        prog({ id: "c", title: "Mannstreff", weekday: 1, start_time: "17:00:00", end_time: "19:00:00" }),
      ],
      [],
      "2026-11-18",
    );
    expect(week.number).toBe(47);
    expect(week.start).toBe("2026-11-16");
    expect(week.days.map((d) => d.name)).toEqual(["Mandag", "Tirsdag"]);
    expect(week.days[1].items.map((i) => `${i.title} ${i.time}`)).toEqual(["Leksehjelp 16.30–18.00", "Språkkafé 18.00–19.30"]);
  });

  it("marks a cancelled date instead of hiding it", () => {
    const week = buildWeek([prog({ weekday: 4, skipped_dates: ["2026-11-19"] })], [], "2026-11-16");
    expect(week.days[0].items[0].note).toBe("avlyst");
  });

  it("shows a programme that starts next week with 'Starter i uke N'", () => {
    const kitchen = prog({ id: "k", title: "Åpent kjøkken", weekday: 3, start_date: "2026-11-25" });
    const w47 = buildWeek([kitchen], [], "2026-11-16");
    expect(w47.days).toHaveLength(1);
    expect(w47.days[0].name).toBe("Onsdag");
    expect(w47.days[0].items[0]).toMatchObject({ note: "starter", startsWeek: 48 });
    // uken etter holdes det som vanlig; to uker før vises ingenting
    expect(buildWeek([kitchen], [], "2026-11-23").days[0].items[0].note).toBeNull();
    expect(buildWeek([kitchen], [], "2026-11-09").days).toHaveLength(0);
  });

  it("includes one-off activities on each day they run, with their own time text", () => {
    const week = buildWeek(
      [],
      [{ id: "e1", title: "Kulturkveld", place: "Storstua", event_date: "2026-11-20", end_date: "2026-11-21", event_time: "19.00" }],
      "2026-11-16",
    );
    expect(week.days.map((d) => d.name)).toEqual(["Fredag", "Lørdag"]);
    expect(week.days[0].items[0]).toMatchObject({ title: "Kulturkveld", time: "19.00", href: "/aktiviteter/e1" });
  });

  it("ignores monthly programmes that do not fall in the week", () => {
    const monthly = prog({ frequency: "monthly", weekday: 0, nth: -1 });
    expect(buildWeek([monthly], [], "2026-11-16").days).toHaveLength(0);
    expect(buildWeek([monthly], [], "2026-11-23").days[0].items[0].title).toBe("Tilbud"); // siste søndag: 29. nov.
  });
});
