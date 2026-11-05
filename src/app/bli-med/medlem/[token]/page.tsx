import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubmissionForm from "@/components/SubmissionForm";
import HoneypotFields from "@/components/HoneypotFields";
import BirthDateInput from "@/components/BirthDateInput";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSiteSettings } from "@/lib/site-settings";
import { ageOn, feeForPerson } from "@/lib/membership-fee";
import { todayOslo } from "@/lib/recurring";
import { MAX_HOUSEHOLD } from "@/lib/household";
import { addHouseholdMember } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Din medlemsside – Mangfoldshuset Vestland",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  expires_at: string | null;
  household_id: string | null;
  pay_token: string;
};

const input = "w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";

async function load(token: string): Promise<{ me: Person; others: Person[] } | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return null;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createAdminClient();
    const cols = "id, first_name, last_name, birth_date, expires_at, household_id, pay_token";
    const { data: me } = await supabase.from("members").select(cols).eq("pay_token", token).maybeSingle();
    if (!me) return null;
    const hid = me.household_id ?? me.id;
    const { data: rest } = await supabase
      .from("members")
      .select(cols)
      .eq("household_id", hid)
      .neq("id", me.id)
      .order("created_at", { ascending: true });
    return { me: me as Person, others: (rest ?? []) as Person[] };
  } catch {
    return null;
  }
}

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ ny?: string; lagt?: string; betal?: string }>;
}) {
  const { token } = await params;
  const { ny, lagt, betal } = await searchParams;
  const data = await load(token);
  if (!data) notFound();
  const { me, others } = data;
  const settings = await fetchSiteSettings();
  const vippsLink = settings.vipps_link;

  const today = todayOslo();
  const active = !!me.expires_at && me.expires_at >= today;
  const fee = feeForPerson(me.birth_date, today);
  const full = others.length + 1 >= MAX_HOUSEHOLD;
  const isPaid = (p: Person) => !!p.expires_at && p.expires_at >= today;
  // Den som nettopp ble lagt til skal betale med en gang.
  const payNow = betal ? others.find((p) => p.pay_token === betal && !isPaid(p)) : undefined;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-20">
        <h1 className="font-serif text-4xl font-medium">Din medlemsside</h1>
        <p className="mt-2 text-ink-soft">
          {me.first_name} {me.last_name}
        </p>

        {ny === "1" && (
          <p className="mt-6 rounded-xl bg-[#EAF0E9] px-5 py-4 text-sm font-semibold text-green-dark">
            Takk for at du melder deg inn! Lagre denne siden, du finner den også i e-posten vi har sendt deg.
          </p>
        )}
        {lagt === "1" && (
          <p className="mt-6 rounded-xl bg-[#EAF0E9] px-5 py-4 text-sm font-semibold text-green-dark">
            Personen er lagt til. Medlemskapet blir aktivt når betalingen er registrert.
          </p>
        )}

        {payNow && (
          <section className="mt-6 rounded-2xl border-2 border-fig bg-white p-6">
            <h2 className="font-serif text-2xl font-medium">
              Betal for {payNow.first_name} nå
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {payNow.first_name} {payNow.last_name} ·{" "}
              <span className="font-semibold text-ink">{feeForPerson(payNow.birth_date, today)} kr</span> per år
              {payNow.birth_date && ageOn(payNow.birth_date, today) < 18 ? " · du betaler som foresatt" : ""}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Betal med Vipps til <span className="font-semibold text-ink">#595791</span> eller til bankkonto{" "}
              <span className="font-semibold text-ink">3207 31 01688</span>, og skriv navnet{" "}
              <span className="font-semibold text-ink">
                {payNow.first_name} {payNow.last_name}
              </span>
              . Hver person har sin egen betaling. Betaling direkte på nettsiden kommer snart.
            </p>
            {vippsLink && (
              <a
                href={vippsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold text-[#1A1512]"
                style={{ backgroundColor: "#FF5B24" }}
              >
                Betal med Vipps for {payNow.first_name}
              </a>
            )}
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-line bg-cream p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-medium">Ditt medlemskap</h2>
              <p className="text-sm text-ink-soft">
                Kontingent: <span className="font-semibold text-ink">{fee} kr</span> per år
              </p>
            </div>
            {active ? (
              <span className="rounded-full bg-[#EAF0E9] px-4 py-2 text-sm font-semibold text-green-dark">
                Betalt – medlem til {me.expires_at}
              </span>
            ) : (
              <span className="rounded-full bg-[#F5EAD5] px-4 py-2 text-sm font-semibold text-[#93701F]">
                {me.expires_at ? `Utløpt ${me.expires_at} – fornyes ved betaling` : "Ikke betalt ennå"}
              </span>
            )}
          </div>

          {!active && (
            <div className="mt-5 text-sm leading-relaxed text-ink-soft">
              <p>
                Betal med Vipps til <span className="font-semibold text-ink">#595791</span> eller til bankkonto{" "}
                <span className="font-semibold text-ink">3207 31 01688</span>, og skriv navnet ditt. Betaling
                direkte på nettsiden kommer snart.
              </p>
              {vippsLink && (
                <a
                  href={vippsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold text-[#1A1512]"
                  style={{ backgroundColor: "#FF5B24" }}
                >
                  Betal med Vipps
                </a>
              )}
              <p className="mt-4 rounded-lg bg-white px-4 py-3">
                Du betaler for deg selv. Først når din egen betaling er registrert, kan du legge til flere i
                familien her.
              </p>
            </div>
          )}
        </section>

        {others.length > 0 && (
          <section className="mt-8">
            <h2 className="font-serif text-2xl font-medium">Flere i familien</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {others.map((p) => {
                const paid = isPaid(p);
                const under18 = !!p.birth_date && ageOn(p.birth_date, today) < 18;
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-5 py-4">
                    <div>
                      <p className="font-semibold text-ink">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {feeForPerson(p.birth_date, today)} kr per år
                        {under18 ? " · foresatt betaler" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          paid ? "bg-[#EAF0E9] text-green-dark" : "bg-[#F5EAD5] text-[#93701F]"
                        }`}
                      >
                        {paid ? "Betalt" : "Ikke betalt"}
                      </span>
                      <Link href={`/bli-med/medlem/${p.pay_token}`} className="text-sm font-semibold text-green-dark underline">
                        Åpne
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {active && !full && (
          <section className="mt-8 rounded-2xl border border-line bg-white p-6">
            <h2 className="font-serif text-2xl font-medium">Legg til en person</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Du kan legge til familiemedlemmer. Hver person blir eget medlem og har sin egen betaling, som du får
              opp med en gang du har lagt til personen. Er personen under 18 år, betaler du som foresatt. Personen må
              selv ha betalt før vedkommende kan legge til flere.
            </p>
            <SubmissionForm action={addHouseholdMember.bind(null, token)} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <HoneypotFields />
              <div className="sm:col-span-2">
                <label htmlFor="add-name" className={label}>Fornavn og etternavn</label>
                <input id="add-name" name="name" required className={input} />
              </div>
              <div>
                <label htmlFor="add-birth" className={label}>Fødselsdato</label>
                <BirthDateInput id="add-birth" name="birth_date" className={input} />
              </div>
              <div>
                <label htmlFor="add-gender" className={label}>Kjønn</label>
                <select id="add-gender" name="gender" required defaultValue="" className={input}>
                  <option value="">Velg</option>
                  <option value="kvinne">Kvinne</option>
                  <option value="mann">Mann</option>
                  <option value="annet">Annet</option>
                  <option value="ukjent">Ønsker ikke å oppgi</option>
                </select>
              </div>
              <label className="block text-sm leading-relaxed text-ink-soft sm:col-span-2">
                <input type="checkbox" name="terms" required className="mr-2 h-5 w-5 shrink-0 align-middle accent-[#9C3B44]" />
                Jeg godtar{" "}
                <a href="/medlemsvilkar" target="_blank" rel="noopener noreferrer" className="underline">
                  medlemsvilkårene
                </a>{" "}
                for denne personen.
              </label>
              <button
                type="submit"
                className="w-fit rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2"
              >
                Legg til
              </button>
            </SubmissionForm>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
