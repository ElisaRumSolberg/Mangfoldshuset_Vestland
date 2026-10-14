"use client";


import { useT } from "@/components/admin/AdminLang";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FLASH_ERR, FLASH_OK } from "@/lib/admin-flash-messages";

function lookup(code: string | null) {
  if (!code) return null;
  const [kind, key] = code.split(":");
  if (kind === "ok" && key in FLASH_OK) {
    return { err: false, text: FLASH_OK[key as keyof typeof FLASH_OK] };
  }
  if (kind === "feil" && key in FLASH_ERR) {
    return { err: true, text: FLASH_ERR[key as keyof typeof FLASH_ERR] };
  }
  return null;
}

/**
 * Viser «Lagret» / feilmelding etter en handling i admin. Handlingene sender brukeren
 * tilbake med ?ok=kode eller ?feil=kode. Parameteren fjernes fra adressen etter visning,
 * så meldingen ikke dukker opp igjen ved oppdatering av siden.
 */
export default function FlashNotice() {
  const t = useT();
  const params = useSearchParams();
  const ok = params.get("ok");
  const err = params.get("feil");
  const code = ok ? `ok:${ok}` : err ? `feil:${err}` : null;

  // Husk meldingen selv om parameteren fjernes fra adressen rett etterpå.
  const [shown, setShown] = useState<string | null>(code);
  const [prev, setPrev] = useState<string | null>(code);
  if (code !== prev) {
    setPrev(code);
    if (code) setShown(code);
  }

  useEffect(() => {
    if (!code) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("ok");
      url.searchParams.delete("feil");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch {}
  }, [code]);

  const found = lookup(shown);
  const notice = found ? { ...found, text: t(found.text) } : null;
  if (!notice) return null;
  const isErr = notice.err;

  return (
    <div
      role={isErr ? "alert" : "status"}
      className={`mb-6 flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 text-sm font-medium ${
        isErr
          ? "border-fig/40 bg-[#F7E9E9] text-fig"
          : "border-green-dark/30 bg-[#EAF0E9] text-green-dark"
      }`}
    >
      <p>
        <span aria-hidden="true">{isErr ? "⚠ " : "✓ "}</span>
        {notice.text}
      </p>
      <button
        type="button"
        onClick={() => setShown(null)}
        aria-label={t("Lukk meldingen")}
        className="-m-2 min-h-11 min-w-11 shrink-0 rounded-full text-lg leading-none hover:opacity-70"
      >{t("×")}
      </button>
    </div>
  );
}
