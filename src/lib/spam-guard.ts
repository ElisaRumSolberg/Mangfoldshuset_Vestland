import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

const MIN_FILL_MS = 2500;
export const HONEYPOT_FIELD = "nettside_url";
export const TIMESTAMP_FIELD = "skjema_startet";

/** Enkle bot-signaler: usynlig felt utfylt, eller skjemaet sendt urealistisk raskt. */
export function looksLikeBot(formData: FormData): boolean {
  if ((formData.get(HONEYPOT_FIELD) as string | null)?.trim()) return true;
  const startedAt = Number(formData.get(TIMESTAMP_FIELD));
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) return true;
  return false;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutter
const MAX_PER_WINDOW = 3;

/** Enkel rate-limit: for mange innsendinger fra samme e-post på kort tid. Bruker
 * service-role-klienten fordi disse tabellene ikke lenger er lesbare for anonyme. */
export async function isRateLimited(table: string, email: string): Promise<boolean> {
  if (!email || !isSupabaseConfigured()) return false;
  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", since);
    return (count ?? 0) >= MAX_PER_WINDOW;
  } catch {
    return false;
  }
}
