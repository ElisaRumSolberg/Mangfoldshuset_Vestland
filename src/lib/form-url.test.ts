import { describe, expect, it } from "vitest";
import { formInt, formList, formText, formUrl, formUrls } from "./form-url";

function fd(fields: [string, string][]) {
  const f = new FormData();
  for (const [k, v] of fields) f.append(k, v);
  return f;
}

describe("formUrl", () => {
  it("returns the value when it looks like an http(s) URL", () => {
    expect(formUrl(fd([["image_url", "https://example.com/x.jpg"]]), "image_url")).toBe(
      "https://example.com/x.jpg"
    );
  });

  it("returns null for a non-URL, missing, or empty value", () => {
    expect(formUrl(fd([["image_url", "not-a-url"]]), "image_url")).toBeNull();
    expect(formUrl(fd([["image_url", ""]]), "image_url")).toBeNull();
    expect(formUrl(new FormData(), "image_url")).toBeNull();
  });
});

describe("formUrls", () => {
  it("keeps only valid URLs, dropping garbage entries", () => {
    const data = fd([
      ["photos", "https://a.com/1.jpg"],
      ["photos", "javascript:alert(1)"],
      ["photos", ""],
      ["photos", "https://a.com/2.jpg"],
    ]);
    expect(formUrls(data, "photos")).toEqual(["https://a.com/1.jpg", "https://a.com/2.jpg"]);
  });

  it("returns an empty array when the field is absent", () => {
    expect(formUrls(new FormData(), "photos")).toEqual([]);
  });
});

describe("formText", () => {
  it("trims whitespace and returns null for blank input", () => {
    expect(formText(fd([["name", "  Kari  "]]), "name")).toBe("Kari");
    expect(formText(fd([["name", "   "]]), "name")).toBeNull();
    expect(formText(new FormData(), "name")).toBeNull();
  });
});

describe("formList", () => {
  it("de-duplicates and drops blank values", () => {
    const data = fd([
      ["categories", "Kultur"],
      ["categories", "Kultur"],
      ["categories", ""],
      ["categories", "Barn"],
    ]);
    expect(formList(data, "categories")).toEqual(["Kultur", "Barn"]);
  });
});

describe("formInt", () => {
  it("parses a valid non-negative integer", () => {
    expect(formInt(fd([["participants", "42"]]), "participants")).toBe(42);
    expect(formInt(fd([["participants", "0"]]), "participants")).toBe(0);
  });

  it("returns null for negative numbers, decimals, or non-numeric text", () => {
    expect(formInt(fd([["participants", "-1"]]), "participants")).toBeNull();
    expect(formInt(fd([["participants", "1.5"]]), "participants")).toBeNull();
    expect(formInt(fd([["participants", "abc"]]), "participants")).toBeNull();
  });

  it("returns null when the field is missing", () => {
    expect(formInt(new FormData(), "participants")).toBeNull();
  });
});
