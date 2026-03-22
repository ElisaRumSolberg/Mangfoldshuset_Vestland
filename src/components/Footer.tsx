import Link from "next/link";
import Image from "next/image";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { LocationIcon, MailIcon, PhoneIcon } from "./ContactIcons";

export default function Footer({
  showNewsletter = true,
}: {
  showNewsletter?: boolean;
}) {
  return (
    <footer className="mt-auto bg-[#36452F] text-[#D9D4C2]">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 ${
          showNewsletter ? "md:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
        <div>
          <Image
            src="/logo-white.png"
            alt="Mangfoldhuset Vestland"
            width={368}
            height={190}
            className="h-24 w-auto"
          />
          <p className="mt-4 max-w-[280px] text-sm leading-relaxed">
            Et inkluderende fellesskap der mennesker, ideer og muligheter
            møtes.
          </p>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <p className="flex items-start gap-2.5">
              <span className="text-[#E7A5AC]"><LocationIcon /></span>
              Arne Abrahamsens vei 1, Bergen
            </p>
            <a
              href="mailto:ali.mangfoldhuset@gmail.com"
              className="flex items-center gap-2.5 hover:text-white"
            >
              <span className="text-[#E7A5AC]"><MailIcon /></span>
              ali.mangfoldhuset@gmail.com
            </a>
            <a href="tel:40567853" className="flex items-center gap-2.5 hover:text-white">
              <span className="text-[#E7A5AC]"><PhoneIcon /></span>
              405 67 853
            </a>
            <p>
              <span className="font-semibold italic text-[#E7A5AC]">Vipps</span>{" "}
              #595791
            </p>
            <p>
              <span className="font-semibold text-white">Org.nr:</span> 914 732 999
            </p>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-sm font-bold uppercase tracking-wider text-white">
            Snarveier
          </p>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link href="/om-oss" className="hover:text-white">Om oss</Link>
            <Link href="/aktiviteter" className="hover:text-white">Aktiviteter</Link>
            <Link href="/bli-med" className="hover:text-white">Bli frivillig</Link>
            <Link href="/kontakt" className="hover:text-white">Kontakt</Link>
            <Link href="/personvern" className="hover:text-white">Personvern</Link>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-sm font-bold uppercase tracking-wider text-white">
            Følg oss videre
          </p>
          <div className="flex gap-2.5">
            <a
              href="https://www.facebook.com/mangfoldhusetvestlandet/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#9C3B44" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/mangfoldhusetvestlandet/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#6E8B67" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
              </svg>
            </a>
          </div>
          <p className="mt-4 max-w-[260px] text-sm leading-relaxed">
            Følg oss på sosiale medier og få med deg aktiviteter, nyheter og
            små glimt fra Mangfoldhuset Vestland.
          </p>
        </div>

        {showNewsletter && (
          <div>
            <p className="mb-3.5 text-sm font-bold uppercase tracking-wider text-white">
              Meld deg på
            </p>
            <p className="mb-3.5 text-sm leading-relaxed">
              Hold deg oppdatert! Meld deg på nyhetsbrevet og få informasjon om
              kommende aktiviteter og arrangementer.
            </p>
            <form action={subscribeNewsletter} className="flex flex-col gap-2.5">
              <input
                type="email"
                name="email"
                required
                placeholder="Skriv inn e-posten din"
                className="w-full rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#B4B8A6] focus:border-white/50"
              />
              <button
                type="submit"
                className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
              >
                Meld meg på
              </button>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-[#B4B8A6]">
              Du kan når som helst melde deg av. Vi deler ikke kontaktinformasjonen din med andre.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-[#B4B8A6]">
          © {new Date().getFullYear()} Mangfoldhuset Vestland
        </div>
      </div>
    </footer>
  );
}
