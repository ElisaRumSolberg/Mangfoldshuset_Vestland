import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { UUID_RE, parseActivitySlug, slugify } from "@/lib/slug";

/** Finner en aktivitet fra adressen: leselig (tittel-dato) eller den gamle id-en. */
export async function getActivityByKey(key: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (UUID_RE.test(key)) {
    const { data } = await supabase.from("activities").select("*").eq("id", key).maybeSingle();
    return data;
  }
  const parsed = parseActivitySlug(key);
  if (!parsed) return null;
  const { data } = await supabase.from("activities").select("*").eq("event_date", parsed.date);
  return (data ?? []).find((a) => slugify(String(a.title ?? "")) === parsed.base) ?? null;
}
