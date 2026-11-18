import { csvCell } from "@/lib/payments-report";

export const VOLUNTEER_STATUSES = ["ny", "aktiv", "pause", "sluttet"] as const;
export type VolunteerStatus = (typeof VOLUNTEER_STATUSES)[number];

export const STATUS_LABEL: Record<VolunteerStatus, string> = {
  ny: "Ny",
  aktiv: "Aktiv",
  pause: "På pause",
  sluttet: "Sluttet",
};

export function isVolunteerStatus(v: unknown): v is VolunteerStatus {
  return typeof v === "string" && (VOLUNTEER_STATUSES as readonly string[]).includes(v);
}

export type Volunteer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  interests: string[];
  availability: string[];
  programs: string | null;
  status: VolunteerStatus;
  note: string | null;
  application_id: string | null;
  created_at: string;
};

export type ApplicationRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  data: Record<string, string | string[]>;
  created_at: string;
  status?: string | null;
  note?: string | null;
};

const list = (v: string | string[] | undefined): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).map((s) => s.trim()).filter(Boolean);

/** Gjør en «Bli frivillig»-søknad om til et frivilligkort (feltene fra skjemaet). */
export function volunteerFromApplication(a: ApplicationRow) {
  const skills = list(a.data.ferdigheter).join(" ");
  const wish = list(a.data.type_bidrag).join(", ");
  const note = [wish && `Ønsker: ${wish}`, skills && `Ferdigheter: ${skills}`].filter(Boolean).join("\n") || null;
  return {
    name: a.name,
    email: a.email || null,
    phone: a.phone || null,
    interests: list(a.data.interesser),
    availability: list(a.data.tilgjengelighet),
    programs: null as string | null,
    status: "ny" as VolunteerStatus,
    note,
    application_id: a.id,
  };
}

/** Søk (navn, e-post, telefon, tilbud, notat, interesser) og filter på status. */
export function filterVolunteers(rows: Volunteer[], q: string, status: string): Volunteer[] {
  const needle = q.trim().toLowerCase();
  return rows.filter((v) => {
    if (isVolunteerStatus(status) && v.status !== status) return false;
    if (!needle) return true;
    const hay = [v.name, v.email, v.phone, v.programs, v.note, ...v.interests, ...v.availability]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

/** Fra et skjema (kommaseparert) til en liste uten tomme og doble verdier. */
export function splitList(v: FormDataEntryValue | null): string[] {
  if (typeof v !== "string") return [];
  return [...new Set(v.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean))];
}

/** Semikolonseparert CSV med BOM, som åpnes riktig i norsk Excel. */
export function volunteersCsv(rows: Volunteer[]): string {
  const header = ["Navn", "E-post", "Telefon", "Status", "Hjelper på", "Interesser", "Når kan de", "Notat", "Registrert"];
  const lines = rows.map((v) =>
    [
      v.name,
      v.email,
      v.phone,
      STATUS_LABEL[v.status] ?? v.status,
      v.programs,
      v.interests.join(", "),
      v.availability.join(", "),
      v.note,
      v.created_at.slice(0, 10),
    ]
      .map(csvCell)
      .join(";"),
  );
  return "﻿" + [header.map(csvCell).join(";"), ...lines].join("\r\n") + "\r\n";
}
