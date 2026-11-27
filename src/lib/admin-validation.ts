// Serverkontroll av admin-skjemaene. Hver funksjon gir koden til den første feilen
// (se admin-flash-messages), eller null når skjemaet kan lagres. Verdiene endres ikke her.

import { z } from "zod";
import type { FlashErr } from "./admin-flash-messages";
import { WEEKDAY_OPTIONS } from "./recurring";

const required = z.string().trim().min(1);
const date = z.iso.date();
const optionalDate = z.union([z.literal(""), date]);
const optionalEmail = z.union([z.literal(""), z.string().trim().max(200).pipe(z.email())]);

/** Tomt, eller et heltall mellom min og max. */
const optionalInt = (min: number, max = 1_000_000) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= min && Number(v) <= max));

/** Tomt, eller timer mellom 0 og 24. Komma godtas som desimaltegn. */
const optionalHours = z
  .string()
  .trim()
  .refine((v) => {
    if (v === "") return true;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= 24;
  });

/** Ingen, én eller flere datoer skilt med komma, semikolon eller mellomrom. */
const dateList = z.string().refine((v) =>
  v
    .split(/[\s,;]+/)
    .filter(Boolean)
    .every((d) => date.safeParse(d).success),
);

type Rule = [field: string, schema: z.ZodType, code: FlashErr];

function value(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function firstError(formData: FormData, rules: Rule[]): FlashErr | null {
  for (const [field, schema, code] of rules) {
    if (!schema.safeParse(value(formData, field)).success) return code;
  }
  return null;
}

/** Sluttverdien kan ikke komme før startverdien. Gjelder bare når begge er fylt ut. */
function endsBeforeStart(formData: FormData, start: string, end: string, strict: boolean): boolean {
  const a = value(formData, start);
  const b = value(formData, end);
  if (!a || !b) return false;
  return strict ? b <= a : b < a;
}

export function checkActivity(formData: FormData): FlashErr | null {
  return (
    firstError(formData, [
      ["title", required, "mangler-felt"],
      ["place", required, "mangler-felt"],
      ["description", required, "mangler-felt"],
      ["event_date", date, "ugyldig-dato-felt"],
      ["end_date", optionalDate, "ugyldig-dato-felt"],
      ["responsible_email", optionalEmail, "ugyldig-epost"],
      ["participants", optionalInt(0), "ugyldig-tall"],
      ["volunteer_hours", optionalInt(0), "ugyldig-tall"],
    ]) ?? (endsBeforeStart(formData, "event_date", "end_date", false) ? "slutt-for-start" : null)
  );
}

const weekdays = WEEKDAY_OPTIONS.map((d) => String(d.value));

export function checkProgram(formData: FormData): FlashErr | null {
  return (
    firstError(formData, [
      ["title", required, "mangler-felt"],
      ["place", required, "mangler-felt"],
      ["weekday", z.string().refine((v) => weekdays.includes(v)), "generell"],
      ["start_date", optionalDate, "ugyldig-dato-felt"],
      ["end_date", optionalDate, "ugyldig-dato-felt"],
      ["skipped_dates", dateList, "ugyldig-avlyst-dato"],
      ["contact", optionalEmail, "ugyldig-epost"],
      ["participants", optionalInt(0), "ugyldig-tall"],
      ["avg_participants", optionalInt(0), "ugyldig-tall"],
      ["volunteers_per_session", optionalInt(0), "ugyldig-tall"],
      ["weeks_per_year", optionalInt(1, 52), "ugyldig-tall"],
      ["hours_per_volunteer", optionalHours, "ugyldig-tall"],
      ["menu_image_week", optionalInt(1, 53), "ugyldig-tall"],
    ]) ??
    (endsBeforeStart(formData, "start_date", "end_date", false) ||
    endsBeforeStart(formData, "start_time", "end_time", true)
      ? "slutt-for-start"
      : null)
  );
}

/** `today` er ÅÅÅÅ-MM-DD (norsk tid). */
export function checkMember(formData: FormData, today: string): FlashErr | null {
  const birthDate = z.union([z.literal(""), date.refine((v) => v <= today)]);
  const familyDates: Rule[] = [1, 2, 3, 4, 5].map((n) => [`fam_birth_${n}`, birthDate, "ugyldig-fodselsdato"]);
  return firstError(formData, [
    ["first_name", required, "mangler-felt"],
    ["last_name", required, "mangler-felt"],
    ["email", required, "mangler-felt"],
    ["email", optionalEmail, "ugyldig-epost"],
    ["birth_date", birthDate, "ugyldig-fodselsdato"],
    ...familyDates,
    ["expires_at", optionalDate, "ugyldig-dato-felt"],
  ]);
}

export function checkStats(formData: FormData): FlashErr | null {
  return firstError(formData, [
    ["participants", optionalInt(0), "ugyldig-tall"],
    ["volunteer_hours", optionalInt(0), "ugyldig-tall"],
  ]);
}
