import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteApplication, saveApplicationNote, setApplicationStatus } from "./actions";
import DeleteButton from "../DeleteButton";

const TYPE_LABELS: Record<string, string> = {
  frivillig: "Frivillig",
  ide: "Idé",
  samarbeid: "Samarbeid",
};

const TABS = [
  { key: "", label: "Alle" },
  { key: "frivillig", label: "Frivillige" },
  { key: "ide", label: "Idéer" },
  { key: "samarbeid", label: "Samarbeid" },
];

export default async function AdminSkjemaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "" } = await searchParams;
  const t = await getT();
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });
  const all = items ?? [];
  const visible = type ? all.filter((a) => a.type === type) : all;
  const countOf = (key: string) => (key ? all.filter((a) => a.type === key).length : all.length);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Frivillige, idéer og samarbeid")}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">{t("Dette er det folk har sendt inn via «Bli med»-siden: frivillige, idéer og forslag om samarbeid. Svar dem på e-post eller telefon. Slett når du er ferdig.")}
      </p>

      <nav aria-label={t("Filtrer på type")} className="mt-6 flex flex-wrap gap-x-6 border-b border-line">
        {TABS.map((tab) => {
          const active = tab.key === type;
          return (
            <Link
              key={tab.key || "alle"}
              href={tab.key ? `/admin/skjema?type=${tab.key}` : "/admin/skjema"}
              aria-current={active ? "page" : undefined}
              className={`-mb-px inline-flex min-h-11 items-center border-b-[3px] px-1 text-sm font-semibold transition-colors ${
                active ? "border-fig text-ink" : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t(tab.label)} ({countOf(tab.key)})
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex flex-col gap-3">
        {visible.length ? (
          visible.map((a) => (
            <div key={a.id} className="rounded-xl border border-line bg-cream p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    <span className="mr-2 rounded-full bg-[#F7E9E9] px-2.5 py-0.5 font-sans text-xs font-bold text-fig">
                      {t(TYPE_LABELS[a.type] ?? a.type)}
                    </span>
                    {a.name}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {a.email}
                    {a.phone ? ` · ${a.phone}` : ""} ·{" "}
                    {new Date(a.created_at).toLocaleString("nb-NO")}
                  </p>
                </div>
                <form action={deleteApplication.bind(null, a.id)}>
                  <DeleteButton what={t("søknaden fra {name}", { name: a.name })} />
                </form>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    a.status === "behandlet" ? "bg-[#EAF0E9] text-green-dark" : "bg-[#F5EAD5] text-[#93701F]"
                  }`}
                >
                  {a.status === "behandlet" ? t("Behandlet") : t("Ny")}
                </span>
                <form action={setApplicationStatus.bind(null, a.id, a.status === "behandlet" ? "ny" : "behandlet")}>
                  <button type="submit" className="min-h-11 rounded-lg border border-line px-4 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig">
                    {a.status === "behandlet" ? t("Åpne igjen") : t("Marker som behandlet")}
                  </button>
                </form>
                {a.type === "frivillig" && (
                  <Link href="/admin/frivillige" className="inline-flex min-h-11 items-center text-sm font-semibold text-fig underline underline-offset-4">
                    {t("Åpne i Frivillige")}
                  </Link>
                )}
              </div>
              <dl className="mt-3 flex flex-col gap-1 text-sm text-ink-soft">
                {Object.entries(a.data as Record<string, string | string[]>).map(
                  ([k, v]) => (
                    <div key={k}>
                      <dt className="inline font-semibold text-ink">{k}: </dt>
                      <dd className="inline">{Array.isArray(v) ? v.join(", ") : v}</dd>
                    </div>
                  )
                )}
              </dl>
              <form action={saveApplicationNote.bind(null, a.id)} className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                  <label htmlFor={`note-${a.id}`} className="mb-1 block text-xs font-semibold text-ink-soft">{t("Notat")}</label>
                  <input
                    id={`note-${a.id}`}
                    name="note"
                    defaultValue={a.note ?? ""}
                    placeholder={t("F.eks. «Ringt 20. nov., møter opp torsdag»")}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
                  />
                </div>
                <button type="submit" className="min-h-11 rounded-lg border border-fig px-4 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white">
                  {t("Lagre notat")}
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">{t("Ingen skjema ennå.")}</p>
        )}
      </div>
    </div>
  );
}
