import Link from "next/link";
import Image from "next/image";
import { LocationIcon, MailIcon, PhoneIcon } from "./ContactIcons";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#36452F] text-[#D9D4C2]">
      <div className="flex flex-col gap-10 px-8 py-14 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12">
          <Image
            src="/logo-white.png"
            alt="Mangfoldhuset Vestland"
            width={368}
            height={190}
            className="h-28 w-auto self-start sm:self-center"
          />
          <div className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-semibold text-white">Org.nr:</span> 914 732 999
            </p>
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
          </div>
        </div>

        <div className="md:pr-8">
          <Link
            href="/bli-med#medlem"
            className="mb-8 inline-block rounded-full bg-fig px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-fig-dark"
          >
            Bli medlem
          </Link>
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
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="flex items-center justify-between px-8 py-5 text-xs text-[#B4B8A6]">
          <span>© {new Date().getFullYear()} Mangfoldhuset Vestland</span>
          <Link href="/personvern" className="hover:text-white">
            Personvern
          </Link>
        </div>
      </div>
    </footer>
  );
}
