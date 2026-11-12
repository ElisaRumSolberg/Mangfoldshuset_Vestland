import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Støtt oss – Mangfoldshuset Vestland",
  robots: { index: false, follow: false },
};

export default function DonationError() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-20">
        <h1 className="font-serif text-4xl font-medium">Støtt oss</h1>
        <p className="mt-6 rounded-xl bg-[#F5EAD5] px-5 py-4 text-sm font-semibold text-[#93701F]">
          Vi kunne ikke starte gaven. Ingen penger er trukket.
        </p>
        <p className="mt-4 text-ink-soft">
          Prøv igjen om litt, eller gi med Vipps til <span className="font-semibold text-ink">#595791</span> eller til
          bankkonto <span className="font-semibold text-ink">3207 31 01688</span>.
        </p>
        <div className="mt-6">
          <Link href="/" className="rounded-lg border border-line px-6 py-3 text-sm font-semibold text-ink">
            Til forsiden
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
