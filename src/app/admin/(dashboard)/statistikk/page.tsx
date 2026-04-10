import { createClient } from "@/lib/supabase/server";
import { updateStats } from "./actions";
import { autoParticipants } from "@/lib/stats";

export default async function AdminStatistikkPage() {
  const supabase = await createClient();
  const { data: stats } = await supabase.from("impact_stats").select("*");

  const auto = await autoParticipants(supabase);

  const get = (key: string) =>
    stats?.find((s) => s.key === key)?.value ?? 0;

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Statistikk</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Tallene som vises på forsiden (&ldquo;Vår innsats&rdquo;).
      </p>

      <form
        action={updateStats}
        className="mt-8 flex max-w-sm flex-col gap-4 rounded-2xl border border-line bg-cream p-6"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Aktiviteter i år
          </label>
          <input
            name="activities"
            type="number"
            defaultValue={get("activities")}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Deltakere før nettsiden / utenfor rapportene
          </label>
          <input
            name="participants"
            type="number"
            defaultValue={get("participants")}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
          <p className="mt-1.5 text-xs text-ink-soft">
            I tillegg summeres deltakere fra aktiviteter og faste tilbud automatisk ({auto}).
            Forsiden viser totalt <strong>{get("participants") + auto}</strong>.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Frivillige timer
          </label>
          <input
            name="volunteer_hours"
            type="number"
            defaultValue={get("volunteer_hours")}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <button
          type="submit"
          className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >
          Lagre
        </button>
      </form>
    </div>
  );
}
