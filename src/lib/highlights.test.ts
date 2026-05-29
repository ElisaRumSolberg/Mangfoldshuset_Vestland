import { describe, expect, it } from "vitest";
import { formatHighlightDate, parseHighlights } from "./highlights";

describe("parseHighlights", () => {
  it("returns an empty array for null or empty input", () => {
    expect(parseHighlights(null)).toEqual([]);
    expect(parseHighlights("")).toEqual([]);
    expect(parseHighlights("   \n  \n")).toEqual([]);
  });

  it("parses a well-formed line", () => {
    expect(parseHighlights("17.06.2026: Besøk av Firat Bahcivan.")).toEqual([
      { date: "2026-06-17", text: "Besøk av Firat Bahcivan." },
    ]);
  });

  it("sorts multiple entries newest first", () => {
    const raw = "01.01.2026: Eldst.\n17.06.2026: Nyest.\n26.04.2026: Midt.";
    expect(parseHighlights(raw).map((h) => h.text)).toEqual(["Nyest.", "Midt.", "Eldst."]);
  });

  it("keeps a malformed line (no date) as text-only, without crashing", () => {
    expect(parseHighlights("bare litt tekst uten dato")).toEqual([
      { date: "", text: "bare litt tekst uten dato" },
    ]);
  });

  it("ignores blank lines between entries", () => {
    const raw = "17.06.2026: A.\n\n\n26.04.2026: B.";
    expect(parseHighlights(raw)).toHaveLength(2);
  });
});

describe("formatHighlightDate", () => {
  it("returns an empty string for an empty date", () => {
    expect(formatHighlightDate("")).toBe("");
  });

  it("formats an ISO date in Norwegian", () => {
    expect(formatHighlightDate("2026-06-17").toLowerCase()).toContain("juni");
  });
});
