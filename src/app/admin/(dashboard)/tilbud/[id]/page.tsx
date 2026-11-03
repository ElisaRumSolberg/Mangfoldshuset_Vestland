import { getT } from "@/lib/admin-i18n-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { shortDate, todayOslo, toProgram } from "@/lib/recurring";
import { deleteProgramSignup, updateProgram } from "../actions";
import TilbudForm from "../TilbudForm";
import ShareBox from "../../ShareBox";
import DeleteButton from "../../DeleteButton";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getT();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: signups }] = await Promise.all([
    supabase.from("recurring_programs").select("*").eq("id", id).single(),
    supabase
      .from("program_signups")
      .select("*")
      .eq("program_id", id)
      .gte("session_date", todayOslo())
      .order("session_date", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (!data) notFound();
  const program = toProgram(data);

  const byDate = new Map<string, NonNullable<typeof signups>>();
  for (const s of signups ?? []) {
    byDate.set(s.session_date, [...(byDate.get(s.session_date) ?? []), s]);
  }

  return (
    <div>
      <Link href="/admin/tilbud" className="text-sm text-ink-soft hover:text-ink">{t("← Tilbake til faste tilbud")}
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">{t("Rediger tilbud")}</h1>

      <ShareBox
        url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/tilbud/${id}`}
      />

      <TilbudForm
        action={updateProgram.bind(null, id)}
        program={program}
        submitLabel="Lagre endringer"
      />

      <div id="pameldte" className="mt-10 scroll-mt-6">
        <h2 className="font-serif text-xl font-medium text-ink">{t("Påmeldte (kommende samlinger)")}</h2>
        {byDate.size === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">{t("Ingen påmeldte ennå.")}</p>
        ) : (
          [...byDate.entries()].map(([date, list]) => {
            const people = list.reduce((sum, s) => sum + (s.participants ?? 1), 0);
            return (
              <div key={date} className="mt-6">
                <h3 className="text-base font-semibold capitalize text-ink">
                  {shortDate(date)}{" "}
                  <span className="font-normal text-ink-soft">
                    {t("({n} – {p} personer)", { n: list.length, p: people })}
                  </span>
                </h3>
                <div className="mt-3 flex flex-col gap-3">
                  {list.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream px-5 py-4"
                    >
                      <div>
                        <p className="font-semibold text-ink">
                          {s.name}{" "}
                          <span className="font-normal text-ink-soft">
                            · {s.participants} {s.participants === 1 ? t("person") : t("personer")}
                          </span>
                        </p>
                        <p className="text-sm text-ink-soft">
                          {s.email}
                          {s.phone ? ` · ${s.phone}` : ""} · {new Date(s.created_at).toLocaleString("nb-NO")}
                        </p>
                        {s.comment && <p className="mt-1 text-sm text-ink-soft">«{s.comment}»</p>}
                        <p className="mt-1 text-sm">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              s.photo_consent ? "bg-[#EAF0E9] text-green-dark" : "bg-[#F5EAD5] text-[#93701F]"
                            }`}
                          >
                            {s.photo_consent ? t("Bildesamtykke: ja") : t("Bildesamtykke: nei – ikke publiser bilder")}
                          </span>
                        </p>
                      </div>
                      <form action={deleteProgramSignup.bind(null, id, s.id)}>
                        <DeleteButton what={t("påmeldingen fra {name}", { name: s.name })} />
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
