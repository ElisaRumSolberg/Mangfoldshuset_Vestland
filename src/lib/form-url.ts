/** Leser en filadresse (satt av FileUpload) fra et skjema. Tom eller ugyldig gir null. */
export function formUrl(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && /^https?:\/\//.test(value) ? value : null;
}

/** Alle gyldige filadresser for et felt som finnes flere ganger (f.eks. bildegalleri). */
export function formUrls(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((v): v is string => typeof v === "string" && /^https?:\/\//.test(v));
}

/** Tekstfelt: trimmet tekst, eller null hvis tomt. */
export function formText(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/** Alle ikke-tomme tekstverdier for et felt som finnes flere ganger (f.eks. kategorier). */
export function formList(formData: FormData, key: string): string[] {
  const seen = new Set<string>();
  for (const v of formData.getAll(key)) {
    if (typeof v === "string" && v.trim()) seen.add(v.trim());
  }
  return [...seen];
}

/** Heltall ≥ 0, eller null hvis tomt/ugyldig. */
export function formInt(formData: FormData, key: string): number | null {
  const v = formText(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : null;
}
