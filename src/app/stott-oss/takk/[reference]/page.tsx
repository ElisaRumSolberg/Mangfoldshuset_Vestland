import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { isDonationReference } from "@/lib/vipps";
import { settleByReference } from "@/lib/vipps-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Takk for gaven – Mangfoldshuset Vestland",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Giveren lander her etter Vipps. Gaven sjekkes mot Vipps på serveren; siden kan åpnes flere ganger. */
export default async function DonationReturn({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!isDonationReference(reference)) notFound();

  const result = await settleByReference(reference);
  if (result === "unknown") notFound();

  const copy = {
    paid: { title: "Tusen takk for gaven!", body: "Bidraget ditt går rett til aktivitetene våre i lokalsamfunnet. Vipps har sendt deg kvittering.", tone: "bg-[#EAF0E9] text-green-dark" },
    pending: { title: "Vi venter på bekreftelse fra Vipps", body: "Det kan ta et øyeblikk. Oppdater siden om litt. Du trenger ikke betale på nytt.", tone: "bg-[#F5EAD5] text-[#93701F]" },
    failed: { title: "Gaven gikk ikke gjennom", body: "Ingen penger er trukket. Du kan prøve igjen fra forsiden.", tone: "bg-[#F5EAD5] text-[#93701F]" },
  }[result];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-20">
        <h1 className="font-serif text-4xl font-medium">Støtt oss</h1>
        <p className={`mt-6 rounded-xl px-5 py-4 text-sm font-semibold ${copy.tone}`}>{copy.title}</p>
        <p className="mt-4 text-ink-soft">{copy.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {result === "pending" && (
            <Link href={`/stott-oss/takk/${reference}`} className="rounded-lg bg-fig px-6 py-3 text-sm font-semibold text-white">
              Oppdater
            </Link>
          )}
          <Link href="/" className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-ink">
            Til forsiden
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
