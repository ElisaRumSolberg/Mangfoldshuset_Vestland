import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, parseLang, translate, type AdminLang, type Vars } from "./admin-i18n";

export async function getAdminLang(): Promise<AdminLang> {
  return parseLang((await cookies()).get(ADMIN_LANG_COOKIE)?.value);
}

/** Oversetter for server-komponenter: `const t = await getT();` */
export async function getT() {
  const lang = await getAdminLang();
  return (no: string, vars?: Vars) => translate(lang, no, vars);
}
