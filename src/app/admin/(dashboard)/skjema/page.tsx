import { createClient } from "@/lib/supabase/server";
import { deleteApplication } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  frivillig: "Frivillig",
  ide: "Idé",
  samarbeid: "Samarbeid",
};

export default async function AdminSkjemaPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">
        Frivillige, idéer og samarbeid
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {items?.length ? (
          items.map((a) => (
            <div key={a.id} className="rounded-xl border border-line bg-cream p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    <span className="mr-2 rounded-full bg-[#F7E9E9] px-2.5 py-0.5 font-sans text-xs font-bold text-fig">
                      {TYPE_LABELS[a.type] ?? a.type}
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
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
                  >
                    Slett
                  </button>
                </form>
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
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">Ingen skjema ennå.</p>
        )}
      </div>
    </div>
  );
}
