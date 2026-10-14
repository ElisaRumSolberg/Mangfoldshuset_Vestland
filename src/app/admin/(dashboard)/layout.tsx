import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "./LogoutButton";
import FlashNotice from "./FlashNotice";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { redirect } from "next/navigation";

const links = [
  { href: "/admin", label: "Oversikt", ownerOnly: true },
  { href: "/admin/medlemmer", label: "Medlemmer", ownerOnly: true },
  { href: "/admin/innhold", label: "Innhold", ownerOnly: false },
  { href: "/admin/aktiviteter", label: "Aktiviteter", ownerOnly: false },
  { href: "/admin/tilbud", label: "Faste tilbud", ownerOnly: false },
  { href: "/admin/utvalg", label: "Utvalg", ownerOnly: false },
  { href: "/admin/nyheter", label: "Nyheter", ownerOnly: false },
  { href: "/admin/mangfoldsposten", label: "Mangfoldsposten", ownerOnly: false },
  { href: "/admin/meldinger", label: "Meldinger", ownerOnly: true },
  { href: "/admin/skjema", label: "Søknader", ownerOnly: true },
  { href: "/admin/statistikk", label: "Statistikk", ownerOnly: true },
  { href: "/admin/hjelp", label: "Hjelp", ownerOnly: false },
];

const groups = [
  { label: "Start", hrefs: ["/admin"] },
  {
    label: "Nettsiden",
    hrefs: [
      "/admin/aktiviteter",
      "/admin/tilbud",
      "/admin/utvalg",
      "/admin/nyheter",
      "/admin/mangfoldsposten",
      "/admin/innhold",
    ],
  },
  { label: "Folk", hrefs: ["/admin/medlemmer", "/admin/meldinger", "/admin/skjema"] },
  { label: "Annet", hrefs: ["/admin/statistikk", "/admin/hjelp"] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user);
  if (!user || !role) redirect("/admin/logg-inn?feil=tilgang");
  const visibleLinks =
    role === "utvalg"
      ? links.filter((l) => l.href === "/admin/hjelp")
      : links.filter((l) => !l.ownerOnly || role === "owner");

  return (
    <div className="min-h-screen bg-cream-2">
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-serif text-lg font-semibold text-ink">
              Mangfoldshuset Vestland
            </p>
            <p className="text-xs text-ink-soft">
              Admin
              {role === "editor" ? " · Redaktør" : ""}
              {role === "utvalg" ? " · Utvalg" : ""}
            </p>
          </div>
          <LogoutButton />
        </div>
        <nav
          aria-label="Hovedmeny"
          className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-3 px-6 pb-3 text-sm font-medium text-ink-soft"
        >
          {groups
            .map((g) => ({
              ...g,
              items: visibleLinks.filter((l) => g.hrefs.includes(l.href)),
            }))
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <div key={g.label} className="flex flex-wrap items-center gap-1">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  {g.label}
                </span>
                {g.items.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-full px-4 py-2 hover:bg-ink/5 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Suspense fallback={null}>
          <FlashNotice />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
