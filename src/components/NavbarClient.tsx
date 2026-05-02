"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type MenuItem = { href: string; label: string };

type NavEntry =
  | { type: "link"; href: string; label: string }
  | { type: "dropdown"; href: string; label: string; items: MenuItem[] };

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

const navLink = (active: boolean) =>
  `rounded-full px-4 py-2 transition-colors ${
    active ? "bg-fig/10 font-semibold text-fig" : "hover:bg-ink/5 hover:text-ink"
  }`;

function DropdownMenu({
  label,
  href,
  items,
  pathname,
}: {
  label: string;
  href: string;
  items: MenuItem[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = isActivePath(pathname, href) || items.some((i) => isActivePath(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 ${navLink(active)}`}
      >
        {label}
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={`h-2.5 w-2.5 fill-current transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-cream shadow-lg">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm transition-colors ${
                isActivePath(pathname, i.href)
                  ? "bg-fig/10 font-semibold text-fig"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavbarClient({
  utvalgItems,
}: {
  utvalgItems: MenuItem[];
}) {
  const pathname = usePathname();

  const navEntries: NavEntry[] = [
    { type: "link", href: "/", label: "Hjem" },
    { type: "link", href: "/om-oss", label: "Om oss" },
    {
      type: "dropdown",
      href: "/utvalg",
      label: "Utvalg",
      items: [{ href: "/utvalg", label: "Alle utvalg" }, ...utvalgItems],
    },
    { type: "link", href: "/aktiviteter", label: "Aktiviteter" },
    {
      type: "dropdown",
      href: "/nyheter",
      label: "Nyheter",
      items: [
        { href: "/nyheter", label: "Alle nyheter" },
        { href: "/mangfoldsposten", label: "Mangfoldsposten" },
      ],
    },
    { type: "link", href: "/bli-med", label: "Bli med" },
    { type: "link", href: "/kontakt", label: "Kontakt" },
  ];

  return (
    <header className="sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-stretch border-b border-line bg-cream/90 backdrop-blur-sm">
      <Link
        href="/"
        className="flex items-center justify-center bg-cream px-8 py-4"
      >
        <Image
          src="/logo.png"
          alt="Mangfoldhuset Vestland"
          width={368}
          height={190}
          className="h-16 w-auto sm:h-24"
          priority
        />
      </Link>

      <nav className="hidden items-center justify-center gap-2 text-sm font-medium text-ink-soft md:flex">
        {navEntries.map((entry) =>
          entry.type === "dropdown" ? (
            <DropdownMenu
              key={entry.href}
              label={entry.label}
              href={entry.href}
              items={entry.items}
              pathname={pathname}
            />
          ) : (
            <Link
              key={entry.href}
              href={entry.href}
              className={navLink(isActivePath(pathname, entry.href))}
            >
              {entry.label}
            </Link>
          )
        )}
      </nav>

      <div className="flex items-center gap-5 px-6">
        <Link
          href="/utvalg/ungdom"
          aria-label="Mangfoldhuset Ungdom"
          title="Mangfoldhuset Ungdom"
          className="hidden shrink-0 border-r border-line pr-5 transition-transform hover:-translate-y-0.5 lg:block"
        >
          <Image
            src="/utvalg/mangfoldhuset-ungdom-logo.png"
            alt="Mangfoldhuset Ungdom"
            width={157}
            height={63}
            className="h-20 w-auto"
          />
        </Link>
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
