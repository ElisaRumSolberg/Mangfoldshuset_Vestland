/** Deler «Fornavn Mellomnavn Etternavn» i fornavn og etternavn. Ett enkelt navn får hovedmedlemmets etternavn. */
export function splitName(full: string, fallbackLast: string): { first_name: string; last_name: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first_name: parts[0] ?? "", last_name: fallbackLast };
  return { first_name: parts.slice(0, -1).join(" "), last_name: parts[parts.length - 1] };
}
