"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { translate, type AdminLang, type Vars } from "@/lib/admin-i18n";
import { setAdminLang } from "@/lib/admin-lang-action";

const Ctx = createContext<AdminLang>("no");

export function AdminLangProvider({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useAdminLang() {
  return useContext(Ctx);
}

/** Oversetter for klientkomponenter: `const t = useT();` */
export function useT() {
  const lang = useContext(Ctx);
  return (no: string, vars?: Vars) => translate(lang, no, vars);
}

/** NO | TR-bryter. Valget lagres i en informasjonskapsel i ett år. */
export function LangSwitch() {
  const lang = useContext(Ctx);
  const router = useRouter();

  async function choose(next: AdminLang) {
    if (next === lang) return;
    await setAdminLang(next);
    router.refresh();
  }

  const base = "min-h-11 min-w-11 rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <div role="group" aria-label="Språk / Dil" className="flex gap-1">
      {(["no", "tr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => choose(l)}
          className={`${base} ${
            lang === l ? "bg-fig text-white" : "border border-line text-ink-soft hover:text-ink"
          }`}
        >
          {l === "no" ? "NO" : "TR"}
        </button>
      ))}
    </div>
  );
}
