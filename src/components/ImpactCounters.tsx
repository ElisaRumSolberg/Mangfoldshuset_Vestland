import AnimatedNumber from "./AnimatedNumber";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";
import { autoParticipants } from "@/lib/stats";

const fallback = [
  { key: "activities", target: null as number | null, suffix: "", label: "Aktiviteter i år", color: "#9C3B44" },
  { key: "participants", target: null as number | null, suffix: "+", label: "Deltakere", color: "#4B6B4A" },
  { key: "volunteer_hours", target: null as number | null, suffix: "", label: "Frivillige timer", color: "#9C3B44" },
];

export default async function ImpactCounters({
  variant = "band",
}: {
  variant?: "band" | "hero";
}) {
  let counters = fallback;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("impact_stats").select("*");
    if (data?.length) {
      counters = fallback.map((f) => {
        const row = data.find((d) => d.key === f.key);
        return row ? { ...f, target: row.value, label: row.label } : f;
      });
    }

    // Deltakere registrert på aktiviteter og faste tilbud legges til automatisk.
    const extra = await autoParticipants(supabase);
    if (extra > 0) {
      counters = counters.map((c) =>
        c.key === "participants" ? { ...c, target: (c.target ?? 0) + extra } : c
      );
    }
  }

  if (variant === "hero") {
    return (
      <div className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white sm:text-base">
          Samfunnsinnsats
        </h2>
        <div className="mt-4 flex gap-3 sm:gap-5">
          {counters.map((c) => (
            <div key={c.label} className="flex w-24 flex-col items-center text-center sm:w-32">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#F1E6CC] shadow-md sm:h-32 sm:w-32">
                <span className="font-serif text-2xl font-bold text-fig sm:text-4xl">
                  {c.target === null ? <span aria-label="Tall ikke tilgjengelig">—</span> : <AnimatedNumber target={c.target} suffix={c.suffix} />}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold leading-tight text-white sm:text-sm">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-sm text-xs italic leading-snug text-white">
          *Deltakere summeres fra aktiviteter og faste tilbud. Øvrige tall oppdateres av administrator
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-cream-2">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <h2 className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-green-dark">
          Samfunnsinnsats
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:gap-10">
          {counters.map((c) => (
            <div key={c.label} className="flex flex-col items-center text-center">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full sm:h-36 sm:w-36"
                style={{ backgroundColor: c.color }}
              >
                <span className="font-serif text-xl font-bold text-white sm:text-2xl">
                  {c.target === null ? <span aria-label="Tall ikke tilgjengelig">—</span> : <AnimatedNumber target={c.target} suffix={c.suffix} />}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-ink-soft sm:text-sm">
                {c.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs italic text-ink-soft">
          *Deltakere summeres fra aktiviteter og faste tilbud. Øvrige tall oppdateres av administrator
        </p>
      </div>
    </div>
  );
}
