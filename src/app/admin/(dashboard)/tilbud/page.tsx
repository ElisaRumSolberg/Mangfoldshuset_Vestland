import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { nextOccurrences, shortDate, timeText, todayOslo, whenText, type Program } from "@/lib/recurring";
import { addProgram, deleteProgram } from "./actions";
import TilbudForm from "./TilbudForm";

export default async function AdminTilbudPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_programs")
    .select("*")
    .order("sort_order", { ascending: true });
  const programs = (data ?? []).map((r) => ({
    ...r,
    skipped_dates: r.skipped_dates ?? [],
  })) as Program[];
  const today = todayOslo();

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Faste tilbud</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Aktiviteter som gjentas (hver uke eller hver måned). Datoene regnes ut automatisk og
        vises under «Kommende aktiviteter». Engangsarrangementer legger du inn under
        Aktiviteter.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-fig/40 bg-[#F7E9E9] px-4 py-3 text-sm text-fig">
          Kunne ikke hente faste tilbud: {error.message}. Kjør{" "}
          <code>supabase/tilbud.sql</code> i Supabase SQL Editor først.
        </p>
      )}

      <TilbudForm action={addProgram} submitLabel="Legg til tilbud" />

      <div className="mt-8 flex flex-col gap-3">
        {programs.length ? (
          programs.map((p) => {
            const next = nextOccurrences(p, today, 1)[0];
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-cream px-5 py-4"
              >
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    {p.title}
                    {!p.active && (
                      <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 font-sans text-xs font-medium text-ink-soft">
                        Skjult
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {whenText(p)}
                    {timeText(p) ? ` · ${timeText(p)}` : ""}
                    {next ? ` · neste: ${shortDate(next)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/tilbud/${p.id}`}
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    Rediger
                  </Link>
                  <form action={deleteProgram.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
                    >
                      Slett
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-ink-soft">Ingen faste tilbud ennå.</p>
        )}
      </div>
    </div>
  );
}
