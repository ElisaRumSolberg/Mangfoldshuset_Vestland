import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoneypotFields from "@/components/HoneypotFields";
import { AdminLangProvider, LangSwitch } from "@/components/admin/AdminLang";
import ExpenseForm from "@/app/admin/(dashboard)/utlegg/ExpenseForm";
import { getAdminLang, getT } from "@/lib/admin-i18n-server";
import { expenseCodeConfigured } from "@/lib/expense-access";
import { todayOslo } from "@/lib/recurring";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { receiptUploadTarget, submitPublicExpense } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Utlegg – Mangfoldshuset Vestland",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  kode: "Fellesordet stemmer ikke. Spør kasserer eller styret om riktig ord.",
  dato: "Datoen mangler eller er i fremtiden. Velg datoen du betalte.",
  felt: "Fyll ut navn, e-post og hva utlegget gjelder.",
  linjer: "Legg inn minst én linje med hva som ble kjøpt.",
  linje: "En av linjene mangler antall eller pris, eller har et ugyldig tall.",
  kvittering: "Legg ved bilde eller PDF av kvitteringen, eller huk av for at du ikke har kvittering.",
  "for-mange": "Du har sendt inn mange utlegg på kort tid. Vent noen minutter og prøv igjen.",
  lagring: "Noe gikk galt, og utlegget ble ikke lagret. Prøv igjen.",
  stengt: "Skjemaet er ikke åpent akkurat nå.",
};

/** Utleggsskjema for frivillige uten admin-konto. Ikke lenket fra menyen; krever et fellesord. */
export default async function PublicExpensePage({ searchParams }: { searchParams: Promise<{ feil?: string }> }) {
  const { feil } = await searchParams;
  const lang = await getAdminLang();
  const t = await getT();
  const open = isSupabaseConfigured() && expenseCodeConfigured();

  let purposes: string[] = [];
  if (open) {
    const supabase = await createClient();
    const { data } = await supabase.from("recurring_programs").select("title").eq("active", true).order("title");
    purposes = (data ?? []).map((p) => p.title as string);
  }

  return (
    <AdminLangProvider lang={lang}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif text-4xl font-medium">{t("Utlegg")}</h1>
          <LangSwitch />
        </div>
        <p className="mt-4 text-ink-soft">
          {t("Har du kjøpt noe for foreningen? Fyll ut skjemaet og legg ved bilde av kvitteringen. Kasserer får det, og du får beskjed på e-post når det er behandlet.")}
        </p>

        {feil && ERRORS[feil] && (
          <p role="alert" className="mt-6 rounded-xl bg-[#F7E9E9] px-5 py-4 text-sm font-semibold text-fig">
            {t(ERRORS[feil])}
          </p>
        )}

        {open ? (
          <ExpenseForm
            action={submitPublicExpense}
            defaultName=""
            today={todayOslo()}
            purposes={purposes}
            publicMode
            uploadTarget={receiptUploadTarget}
            extra={<HoneypotFields />}
          />
        ) : (
          <p className="mt-6 rounded-xl bg-[#F5EAD5] px-5 py-4 text-sm font-semibold text-[#93701F]">{t(ERRORS.stengt)}</p>
        )}
      </main>
      <Footer />
    </AdminLangProvider>
  );
}
