/** Leser en filadresse (satt av FileUpload) fra et skjema. Tom eller ugyldig gir null. */
export function formUrl(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && /^https?:\/\//.test(value) ? value : null;
}
