import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

/** A success response must mean the submission was actually stored. */
export async function savePublicSubmission(
  table: "members" | "applications" | "contact_messages" | "activity_signups",
  record: Record<string, unknown>,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.from(table).insert(record);
    return !error;
  } catch {
    // Do not expose database details or personal data in logs or responses.
    return false;
  }
}

/** Notification failure must not turn a saved submission into a retry. */
export async function notifyAfterSave(send: () => Promise<unknown>): Promise<void> {
  try {
    await send();
  } catch {
    // The saved record remains available in the admin dashboard.
  }
}
