import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toUtvalg } from "@/lib/utvalg";
import { addUtvalg, deleteUtvalg } from "./actions";
import UtvalgForm from "./UtvalgForm";

export default async function AdminUtvalgPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("utvalg")
    .select("*")
    .order("title", { ascending: true });
  const utvalg = (data ?? []).map(toUtvalg);

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Utvalg</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Undergrupper i foreningen, f.eks. Kvinneutvalget og Mangfoldhuset
        Ungdom. Hvert utvalg får en enkel side med hva de gjør, deres
        aktiviteter og bilder.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-fig/40 bg-[#F7E9E9] px-4 py-3 text-sm text-fig">
          Kunne ikke hente utvalg: {error.message}. Kjør{" "}
          <code>supabase/utvalg.sql</code> i Supabase SQL Editor først.
        </p>
      )}

      <UtvalgForm action={addUtvalg} submitLabel="Legg til utvalg" />

      <div className="mt-8 flex flex-col gap-3">
        {utvalg.length ? (
          utvalg.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-line bg-cream px-5 py-4"
            >
              <div>
                <p className="font-serif text-base font-semibold text-ink">
                  {u.title}
                  {!u.active && (
                    <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 font-sans text-xs font-medium text-ink-soft">
                      Skjult
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink-soft">/utvalg/{u.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/utvalg/${u.id}`}
                  className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Rediger
                </Link>
                <form action={deleteUtvalg.bind(null, u.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
                  >
                    Slett
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">Ingen utvalg ennå.</p>
        )}
      </div>
    </div>
  );
}
