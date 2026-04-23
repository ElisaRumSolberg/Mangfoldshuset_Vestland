import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagazineViewer, { type Issue } from "@/components/MagazineViewer";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mangfoldsposten – Mangfoldhuset Vestland",
  description: "Mangfoldshusets felles magasin – les siste utgave og eldre utgaver.",
};

export default async function MangfoldspostenPage() {
  let issues: Issue[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("magazine_issues")
      .select("*")
      .order("issue_date", { ascending: false });
    issues = (data ?? []) as Issue[];
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Mangfoldsposten</h1>
        <p className="mt-3 max-w-xl text-base text-ink-soft">
          Mangfoldshusets felles magasin, med nyheter og historier fra hele
          nettverket.
        </p>

        {issues.length > 0 ? (
          <MagazineViewer issues={issues} />
        ) : (
          <p className="mt-10 text-sm text-ink-soft">
            Ingen utgaver er publisert ennå.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
