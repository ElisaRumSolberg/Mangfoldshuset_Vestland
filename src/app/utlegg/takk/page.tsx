import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getT } from "@/lib/admin-i18n-server";

export const metadata: Metadata = {
  title: "Utlegg sendt – Mangfoldshuset Vestland",
  robots: { index: false, follow: false },
};

export default async function ExpenseThanksPage() {
  const t = await getT();
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 pb-16 pt-20">
        <h1 className="font-serif text-4xl font-medium">{t("Takk!")}</h1>
        <p className="mt-6 rounded-xl bg-[#EAF0E9] px-5 py-4 text-sm font-semibold text-green-dark">
          {t("Utlegget er sendt inn. Regnskapsføreren har fått det, og du får beskjed på e-post når det er behandlet.")}
        </p>
        <Link href="/utlegg" className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-fig px-5 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white">
          {t("Send inn et nytt utlegg")}
        </Link>
      </main>
      <Footer />
    </>
  );
}
