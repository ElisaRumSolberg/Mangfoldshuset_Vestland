import Link from "next/link";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/aktiviteter", label: "Aktiviteter" },
  { href: "/admin/nyheter", label: "Nyheter" },
  { href: "/admin/mangfoldsposten", label: "Mangfoldsposten" },
  { href: "/admin/meldinger", label: "Meldinger" },
  { href: "/admin/skjema", label: "Skjema" },
  { href: "/admin/statistikk", label: "Statistikk" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-2">
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-serif text-lg font-semibold text-ink">
              Mangfoldhuset Vestland
            </p>
            <p className="text-xs text-ink-soft">Admin</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-6 pb-3 text-sm font-medium text-ink-soft">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 hover:bg-ink/5 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
