import type { User } from "@supabase/supabase-js";

export type AdminRole = "owner" | "editor" | "utvalg";

/** Roller styres via auth.users.raw_app_meta_data (kan bare settes fra SQL Editor, ikke av brukeren selv). */
export function roleFromUser(user: Pick<User, "app_metadata"> | null): AdminRole {
  const role = user?.app_metadata?.role;
  return role === "editor" || role === "utvalg" ? role : "owner";
}

/** Hvilket utvalg (rad-id) en "utvalg"-bruker skal være låst til. */
export function utvalgIdFromUser(user: Pick<User, "app_metadata"> | null): string | null {
  return (user?.app_metadata?.utvalg_id as string | undefined) ?? null;
}

/** Dashboard-forsiden viser medlemsdata, så den regnes som eksakt sti (ikke prefix). */
const OWNER_ONLY_EXACT = ["/admin"];

/** Sider (og alt under dem) kun "owner" har tilgang til. */
const OWNER_ONLY_PREFIXES = [
  "/admin/medlemmer",
  "/admin/statistikk",
  "/admin/skjema",
  "/admin/meldinger",
];

export function isOwnerOnlyPath(pathname: string) {
  return (
    OWNER_ONLY_EXACT.includes(pathname) ||
    OWNER_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}
