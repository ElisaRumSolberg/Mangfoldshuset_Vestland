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
      <div className="border-t border-white/20 pt-6 xl:border-r xl:border-t-0 xl:pr-8 xl:pt-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#F3E2B3] xl:text-sm">
          Samfunnsinnsats
        </h2>
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-10 xl:flex-col xl:gap-y-6">
          {counters.map((c) => (
            <div key={c.label}>
              <p className="font-serif text-3xl font-medium text-white xl:text-5xl">
                {c.target === null ? <span aria-label="Tall ikke tilgjengelig">—</span> : <AnimatedNumber target={c.target} suffix={c.suffix} />}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#F5F0E4] sm:text-sm xl:text-base">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 max-w-xs text-xs italic leading-snug text-[#F5F0E4]/90">
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
