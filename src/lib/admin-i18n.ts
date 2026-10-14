// Språkvalg for admin-panelet (norsk / tyrkisk). Nettsiden for besøkende er alltid norsk.
// Tekstene i koden er den norske originalen og fungerer samtidig som nøkkel i ordlisten.

import { TR } from "./admin-i18n-tr";

export type AdminLang = "no" | "tr";
export const ADMIN_LANG_COOKIE = "admin_lang";

export function parseLang(v: string | undefined | null): AdminLang {
  return v === "tr" ? "tr" : "no";
}

export type Vars = Record<string, string | number>;

export function translate(lang: AdminLang, no: string, vars?: Vars): string {
  let out = lang === "tr" ? (TR[no] ?? no) : no;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}
