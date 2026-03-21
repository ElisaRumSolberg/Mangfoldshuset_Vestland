import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LocationIcon, MailIcon, PhoneIcon } from "@/components/ContactIcons";
import { sendContactMessage } from "./actions";

export const metadata: Metadata = {
  title: "Kontakt – Mangfoldhuset Vestland",
  description: "Ta kontakt med Mangfoldhuset Vestland.",
};

export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string }>;
}) {
  const { sendt } = await searchParams;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="font-serif text-4xl font-medium">Ta kontakt</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Har du et spørsmål, en idé eller ønsker du å samarbeide med oss?
          Send oss en melding, så svarer vi så snart vi kan.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-14 md:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-[18px] border border-line bg-cream-2 p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink">
                Kontaktinformasjon
              </p>
              <div className="flex flex-col gap-4 text-sm text-ink-soft">
                <p className="flex items-start gap-2.5">
                  <LocationIcon />
                  Arne Abrahamsens vei 1, Bergen
                </p>
                <a
                  href="mailto:ali.mangfoldhuset@gmail.com"
                  className="flex items-center gap-2.5 hover:text-ink"
                >
                  <MailIcon />
                  ali.mangfoldhuset@gmail.com
                </a>
                <a href="tel:40567853" className="flex items-center gap-2.5 hover:text-ink">
                  <PhoneIcon />
                  405 67 853
                </a>
              </div>
            </div>

            <div className="rounded-[18px] border border-line bg-cream-2 p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink">
                Følg oss
              </p>
              <div className="flex gap-2.5">
                <a
                  href="https://www.facebook.com/mangfoldhusetvestlandet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "#9C3B44" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1Z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/mangfoldhusetvestlandet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "#4B6B4A" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-white p-8">
            {sendt === "takk" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <p className="font-serif text-2xl">Takk for meldingen!</p>
                <p className="max-w-sm text-sm text-ink-soft">
                  Vi har mottatt henvendelsen din og svarer så snart vi kan.
                </p>
              </div>
            ) : (
              <form action={sendContactMessage} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">
                      Navn
                    </label>
                    <input
                      name="name"
                      required
                      className="w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-fig"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">
                      E-post
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-fig"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">
                    Tema
                  </label>
                  <input
                    name="subject"
                    required
                    placeholder="F.eks. Frivillig, Samarbeid, Generelt spørsmål"
                    className="w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-fig"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">
                    Melding
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-fig"
                  />
                </div>
                <button
                  type="submit"
                  className="w-fit rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
                >
                  Send melding
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer showNewsletter={false} />
    </>
  );
}
