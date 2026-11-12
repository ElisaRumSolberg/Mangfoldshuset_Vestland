import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { isReference } from "@/lib/vipps";
import { settleByReference } from "@/lib/vipps-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Betaling – Mangfoldshuset Vestland",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * Kunden lander her etter Vipps. Vi stoler ikke på selve besøket: betalingen sjekkes mot Vipps og registreres
 * på serveren. Siden kan åpnes flere ganger uten at noe registreres dobbelt.
 */
export default async function PaymentReturn({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!isReference(reference)) notFound();

  const result = await settleByReference(reference);
  if (result === "unknown") notFound();

  let memberLink = "/bli-med";
  try {
    const supabase = createAdminClient();
    const { data: row } = await supabase.from("vipps_payments").select("member_id").eq("reference", reference).maybeSingle();
    if (row) {
      const { data: m } = await supabase.from("members").select("pay_token").eq("id", row.member_id).maybeSingle();
      if (m?.pay_token) memberLink = `/bli-med/medlem/${m.pay_token}`;
    }
  } catch {
    // Lenken tilbake faller bare tilbake til innmeldingssiden.
  }

  const copy = {
    paid: {
      title: "Takk, betalingen er registrert!",
      body: "Medlemskapet er aktivt. Vi har sendt en bekreftelse på e-post.",
      tone: "bg-[#EAF0E9] text-green-dark",
    },
    pending: {
      title: "Vi venter på bekreftelse fra Vipps",
      body: "Det kan ta et øyeblikk. Oppdater siden om litt. Du trenger ikke betale på nytt: får vi bekreftelsen, registreres betalingen automatisk.",
      tone: "bg-[#F5EAD5] text-[#93701F]",
    },
    failed: {
      title: "Betalingen gikk ikke gjennom",
      body: "Ingen penger er trukket. Du kan prøve igjen fra din medlemsside.",
      tone: "bg-[#F5EAD5] text-[#93701F]",
    },
  }[result];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-20">
        <h1 className="font-serif text-4xl font-medium">Betaling</h1>
        <p className={`mt-6 rounded-xl px-5 py-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
        <p className="mt-4 text-ink-soft">{copy.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {result === "pending" && (
            <Link href={`/bli-med/betalt/${reference}`} className="rounded-lg bg-fig px-6 py-3 text-sm font-semibold text-white">
              Oppdater
            </Link>
          )}
          <Link href={memberLink} className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-ink">
            Til medlemssiden
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
