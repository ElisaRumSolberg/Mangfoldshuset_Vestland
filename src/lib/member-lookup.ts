import { createAdminClient } from "@/lib/supabase/admin";

export type ExistingMember = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  expires_at: string | null;
  pay_token: string;
};

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** ilike tolker % og _ som jokertegn; e-postadresser kan inneholde _. */
function escapeLike(v: string) {
  return v.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Finner et medlem som allerede er registrert med samme e-post, navn og fødselsdato, slik at en som
 * «melder seg inn igjen» for å fornye ikke får en ekstra rad (og dermed telles dobbelt).
 * Uten tilgang til databasen returneres null, og innmeldingen går som vanlig.
 */
export async function findExistingMember(p: {
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
}): Promise<ExistingMember | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const { data } = await createAdminClient()
      .from("members")
      .select("id, first_name, last_name, birth_date, expires_at, pay_token")
      .ilike("email", escapeLike(p.email.trim()));
    const found = (data ?? []).find(
      (m) =>
        norm(m.first_name) === norm(p.first_name) &&
        norm(m.last_name) === norm(p.last_name) &&
        m.birth_date === p.birth_date,
    );
    return (found as ExistingMember | undefined) ?? null;
  } catch {
    return null;
  }
}
