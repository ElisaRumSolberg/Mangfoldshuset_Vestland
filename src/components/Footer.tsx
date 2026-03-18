import Link from "next/link";
import { subscribeNewsletter } from "@/app/actions/newsletter";

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2C10.6 18.9 5.1 13.4 4.5 6.2A2 2 0 0 1 6.5 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-cream-2 text-ink-soft">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-5">
        <div>
          <p className="font-serif text-lg font-semibold text-ink">
            Mangfoldhuset Vestland
          </p>
          <p className="mt-3.5 max-w-[260px] text-sm leading-relaxed text-ink-soft">
            En ideell frivillig organisasjon som skaper møteplasser på tvers av
            kultur og bakgrunn.
          </p>
          <div className="mt-4.5 flex gap-2.5">
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
              href="#"
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

        <div>
          <p className="mb-3.5 text-xs font-bold text-ink">Snarveier</p>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link href="/om-oss" className="hover:text-ink">Om oss</Link>
            <Link href="/aktiviteter" className="hover:text-ink">Aktiviteter</Link>
            <Link href="/bli-med" className="hover:text-ink">Bli frivillig</Link>
            <Link href="/kontakt" className="hover:text-ink">Kontakt</Link>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-xs font-bold text-ink">Kontakt</p>
          <div className="flex flex-col gap-3 text-sm text-ink-soft">
            <p className="flex items-start gap-2">
              <LocationIcon />
              Arne Abrahamsens vei 1, Bergen
            </p>
            <a
              href="mailto:ali.mangfoldhuset@gmail.com"
              className="flex items-center gap-2 hover:text-ink"
            >
              <MailIcon />
              ali.mangfoldhuset@gmail.com
            </a>
            <a href="tel:40567853" className="flex items-center gap-2 hover:text-ink">
              <PhoneIcon />
              405 67 853
            </a>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-xs font-bold text-ink">Juridisk</p>
          <div className="flex flex-col gap-2.5 text-sm text-ink-soft">
            <Link href="/personvern" className="hover:text-ink">Personvern</Link>
            <p>Org.nr [xxx xxx xxx]</p>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-xs font-bold text-ink">Hold deg oppdatert!</p>
          <p className="mb-3.5 text-sm leading-relaxed text-ink-soft">
            Meld deg på nyhetsbrevet og få info om kommende aktiviteter.
          </p>
          <form action={subscribeNewsletter} className="flex flex-col gap-2.5">
            <input
              type="email"
              name="email"
              required
              placeholder="Din e-post"
              className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-fig"
            />
            <button
              type="submit"
              className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
            >
              Meld meg på
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-soft/70">
          © {new Date().getFullYear()} Mangfoldhuset Vestland
        </div>
      </div>
    </footer>
  );
}
