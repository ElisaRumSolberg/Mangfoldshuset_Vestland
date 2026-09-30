import { describe, expect, it } from "vitest";
import { isOwnerOnlyPath, roleFromUser, utvalgIdFromUser } from "./roles";

describe("roleFromUser", () => {
  it("denies access when app_metadata is missing", () => {
    expect(roleFromUser(null)).toBeNull();
  });

  it("denies access when role is not set", () => {
    expect(roleFromUser({ app_metadata: {} })).toBeNull();
  });

  it("denies access for an unrecognized role value", () => {
    expect(roleFromUser({ app_metadata: { role: "superadmin" } })).toBeNull();
  });

  it("returns editor when role is editor", () => {
    expect(roleFromUser({ app_metadata: { role: "editor" } })).toBe("editor");
  });

  it("returns utvalg when role is utvalg", () => {
    expect(roleFromUser({ app_metadata: { role: "utvalg" } })).toBe("utvalg");
  });
});

describe("utvalgIdFromUser", () => {
  it("returns null when utvalg_id is missing", () => {
    expect(utvalgIdFromUser({ app_metadata: {} })).toBeNull();
    expect(utvalgIdFromUser(null)).toBeNull();
  });

  it("returns the utvalg_id when present", () => {
    expect(utvalgIdFromUser({ app_metadata: { utvalg_id: "abc-123" } })).toBe("abc-123");
  });
});

describe("isOwnerOnlyPath", () => {
  it("treats the dashboard root as owner-only but not its non-owner children", () => {
    expect(isOwnerOnlyPath("/admin")).toBe(true);
    expect(isOwnerOnlyPath("/admin/aktiviteter")).toBe(false);
  });

  it("matches owner-only prefixes exactly and as sub-paths", () => {
    expect(isOwnerOnlyPath("/admin/medlemmer")).toBe(true);
    expect(isOwnerOnlyPath("/admin/medlemmer/123")).toBe(true);
    expect(isOwnerOnlyPath("/admin/statistikk")).toBe(true);
    expect(isOwnerOnlyPath("/admin/skjema")).toBe(true);
    expect(isOwnerOnlyPath("/admin/meldinger")).toBe(true);
  });

  it("does not false-positive on paths that merely start with the same letters", () => {
    expect(isOwnerOnlyPath("/admin/medlemmer-eksport")).toBe(false);
  });

  it("returns false for editor-accessible paths", () => {
    expect(isOwnerOnlyPath("/admin/tilbud")).toBe(false);
    expect(isOwnerOnlyPath("/admin/utvalg/some-id")).toBe(false);
  });
});
