import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";

const links = [
  { href: "/admin", label: "Dashboard", ownerOnly: true },
  { href: "/admin/medlemmer", label: "Medlemmer", ownerOnly: true },
  { href: "/admin/innhold", label: "Innhold", ownerOnly: false },
  { href: "/admin/aktiviteter", label: "Aktiviteter", ownerOnly: false },
  { href: "/admin/tilbud", label: "Faste tilbud", ownerOnly: false },
  { href: "/admin/utvalg", label: "Utvalg", ownerOnly: false },
  { href: "/admin/nyheter", label: "Nyheter", ownerOnly: false },
  { href: "/admin/mangfoldsposten", label: "Mangfoldsposten", ownerOnly: false },
  { href: "/admin/meldinger", label: "Meldinger", ownerOnly: true },
  { href: "/admin/skjema", label: "Skjema", ownerOnly: true },
  { href: "/admin/statistikk", label: "Statistikk", ownerOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user);
  const visibleLinks =
    role === "utvalg" ? [] : links.filter((l) => !l.ownerOnly || role === "owner");

  return (
    <div className="min-h-screen bg-cream-2">
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-serif text-lg font-semibold text-ink">
              Mangfoldhuset Vestland
            </p>
            <p className="text-xs text-ink-soft">
              Admin
              {role === "editor" ? " · Redaktør" : ""}
              {role === "utvalg" ? " · Utvalg" : ""}
            </p>
          </div>
          <LogoutButton />
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-1 px-6 pb-3 text-sm font-medium text-ink-soft">
          {visibleLinks.map((l) => (
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
