"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Hjem" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/aktiviteter", label: "Aktiviteter" },
  { href: "/nyheter", label: "Nyheter" },
  { href: "/bli-med", label: "Bli med" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-stretch border-b border-line bg-cream/90 backdrop-blur-sm">
      <Link
        href="/"
        className="flex items-center justify-center bg-cream px-6 py-2"
      >
        <Image
          src="/logo.jpg"
          alt="Mangfoldhuset Vestland"
          width={144}
          height={144}
          className="h-24 w-24 object-contain mix-blend-multiply sm:h-32 sm:w-32"
          priority
        />
      </Link>

      <nav className="hidden items-center justify-center gap-2 text-sm font-medium text-ink-soft md:flex">
        {links.map((l) => {
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 transition-colors ${
                isActive
                  ? "bg-fig/10 font-semibold text-fig"
                  : "hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center px-6">
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
