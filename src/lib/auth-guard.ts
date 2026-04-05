import { createClient } from "@/lib/supabase/server";
import { roleFromUser, utvalgIdFromUser, type AdminRole } from "@/lib/roles";

/**
 * Ekstra sikkerhetslag i Server Actions – RLS i databasen er det som faktisk
 * stopper uautoriserte skriv, men denne gir en tidlig, tydelig feilmelding
 * i stedet for en stille RLS-avvisning lenger inn.
 */
async function currentAdmin(): Promise<{ role: AdminRole; utvalgId: string | null } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { role: roleFromUser(user), utvalgId: utvalgIdFromUser(user) };
}

export async function requireOwner() {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") {
    throw new Error("Ikke tilgang – dette krever owner-rolle.");
  }
}

export async function requireEditor() {
  const admin = await currentAdmin();
  if (!admin || (admin.role !== "owner" && admin.role !== "editor")) {
    throw new Error("Ikke tilgang – dette krever owner- eller editor-rolle.");
  }
}

/** For handlinger knyttet til ett spesifikt utvalg (utvalg-rollen er låst til sitt eget). */
export async function requireUtvalgAccess(utvalgId: string) {
  const admin = await currentAdmin();
  if (!admin) throw new Error("Ikke innlogget.");
  if (admin.role === "owner" || admin.role === "editor") return;
  if (admin.role === "utvalg" && admin.utvalgId === utvalgId) return;
  throw new Error("Ikke tilgang til dette utvalget.");
}
