"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/logg-inn");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
    >
      Logg ut
    </button>
  );
}
