import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#2E2B27] text-[#D8D2C4]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-semibold text-white">
            Mangfoldhuset Vestland
          </p>
          <p className="mt-3.5 max-w-[260px] text-sm leading-relaxed text-[#B7AF9C]">
            En ideell frivillig organisasjon som skaper møteplasser på tvers av
            kultur og bakgrunn.
          </p>
          <div className="mt-4.5 flex gap-2.5">
            <a
              href="https://www.facebook.com/mangfoldhusetvestlandet/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-sm hover:bg-white/15"
            >
              f
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-sm hover:bg-white/15"
            >
              ig
            </a>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-xs font-bold text-white">Snarveier</p>
          <div className="flex flex-col gap-2.5 text-sm">
            <Link href="/om-oss">Om oss</Link>
            <Link href="/aktiviteter">Aktiviteter</Link>
            <Link href="/bli-med">Bli frivillig</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-xs font-bold text-white">Kontakt</p>
          <div className="flex flex-col gap-2.5 text-sm text-[#B7AF9C]">
            <p>[Adresse], Bergen</p>
            <p>post@vestland.mangfoldhuset.no</p>
            <p>[Telefon]</p>
          </div>
        </div>

        <div>
          <p className="mb-3.5 text-xs font-bold text-white">Juridisk</p>
          <div className="flex flex-col gap-2.5 text-sm text-[#B7AF9C]">
            <Link href="/personvern">Personvern</Link>
            <p>Org.nr [xxx xxx xxx]</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-[#8E876F]">
          © {new Date().getFullYear()} Mangfoldhuset Vestland
        </div>
      </div>
    </footer>
  );
}
