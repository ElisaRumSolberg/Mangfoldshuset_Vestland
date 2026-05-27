export type Highlight = { date: string; text: string };

/** Parser "DD.MM.ÅÅÅÅ: Tekst"-linjer til en liste, sortert nyest først. */
export function parseHighlights(raw: string | null): Highlight[] {
  if (!raw) return [];
  const items: Highlight[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = /^(\d{2})\.(\d{2})\.(\d{4})\s*:\s*(.+)$/.exec(trimmed);
    if (!match) {
      items.push({ date: "", text: trimmed });
      continue;
    }
    const [, day, month, year, text] = match;
    items.push({ date: `${year}-${month}-${day}`, text: text.trim() });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function formatHighlightDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
