import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Hjem" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/aktiviteter", label: "Aktiviteter" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/bli-med", label: "Bli med" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-white p-2 shadow-sm">
            <Image
              src="/logo.jpg"
              alt="Mangfoldhuset Vestland"
              width={64}
              height={64}
              className="h-full w-full object-contain mix-blend-multiply"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/bli-med"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >
          Bli frivillig
        </Link>
      </div>
    </header>
  );
}
