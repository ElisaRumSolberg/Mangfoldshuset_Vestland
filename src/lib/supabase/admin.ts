import { createClient } from "@supabase/supabase-js";

// Kun for serverkode uten innlogget bruker (f.eks. cron). Omgår RLS.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
