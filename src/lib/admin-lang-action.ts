"use server";

import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, parseLang } from "./admin-i18n";

/** Lagrer språkvalget (no/tr) for admin i en informasjonskapsel. */
export async function setAdminLang(lang: string) {
  (await cookies()).set(ADMIN_LANG_COOKIE, parseLang(lang), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
