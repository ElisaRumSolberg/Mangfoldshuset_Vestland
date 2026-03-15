import AnimatedNumber from "./AnimatedNumber";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { createClient } from "@/lib/supabase/server";

const fallback = [
  { key: "activities", target: 48, suffix: "", label: "Aktiviteter i år", color: "#9C3B44" },
  { key: "participants", target: 1350, suffix: "+", label: "Deltakere", color: "#4B6B4A" },
  { key: "volunteer_hours", target: 1820, suffix: "", label: "Frivillige timer", color: "#9C3B44" },
];

export default async function ImpactCounters() {
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
  }

  return (
    <div className="border-b border-line bg-cream-2">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-10 text-center text-xs font-bold uppercase tracking-widest text-green-dark">
          Vår innsats
        </p>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {counters.map((c) => (
            <div key={c.label} className="flex flex-col items-center text-center">
              <div
                className="flex h-36 w-36 items-center justify-center rounded-full"
                style={{ backgroundColor: c.color }}
              >
                <span className="font-serif text-2xl font-bold text-white">
                  <AnimatedNumber target={c.target} suffix={c.suffix} />
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-soft">
                {c.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs italic text-ink-soft/70">
          *Tallene oppdateres manuelt av administrator
        </p>
      </div>
    </div>
  );
}
