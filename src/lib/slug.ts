/** «Åpent kjøkken» -> «apent-kjokken»: leselig adresse i stedet for en lang id. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Adressen til en aktivitet: tittel + dato, f.eks. /aktiviteter/kulturkveld-2026-10-04. Datoen gjør adressen
 * entydig når samme tittel brukes flere ganger. Gamle id-adresser fungerer fortsatt (de sender videre hit).
 */
export function activityPath(a: { id: string; title: string; event_date: string }): string {
  const base = slugify(a.title);
  const date = String(a.event_date).slice(0, 10);
  return base && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `/aktiviteter/${base}-${date}` : `/aktiviteter/${a.id}`;
}

/** Deler «kulturkveld-2026-10-04» i tittel-delen og datoen. */
export function parseActivitySlug(key: string): { base: string; date: string } | null {
  const m = /^(.*?)-?(\d{4}-\d{2}-\d{2})$/.exec(key.toLowerCase());
  return m ? { base: m[1], date: m[2] } : null;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
