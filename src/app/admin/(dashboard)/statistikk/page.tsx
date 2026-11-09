import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { updateStats } from "./actions";
import { autoActivities, autoParticipants, autoVolunteerHours } from "@/lib/stats";
import { todayOslo } from "@/lib/recurring";

export default async function AdminStatistikkPage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: stats } = await supabase.from("impact_stats").select("*");

  const auto = await autoParticipants(supabase);
  const acts = await autoActivities(supabase, todayOslo());
  const autoHours = await autoVolunteerHours(supabase, todayOslo());

  const get = (key: string) =>
    stats?.find((s) => s.key === key)?.value ?? 0;

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Statistikk")}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t("Tallene i «Samfunnsinnsats»-feltet på forsiden. Deltakere regnes ut automatisk fra aktivitetene dine; her legger du bare til det som ikke er registrert andre steder.")}
      </p>

      <form
        action={updateStats}
        className="mt-8 flex max-w-sm flex-col gap-4 rounded-2xl border border-line bg-cream p-6"
      >
        <div>
          <p className="mb-1 text-sm font-medium text-ink">{t("Aktiviteter i år")}</p>
          <p className="rounded-lg bg-white px-3 py-2 font-serif text-2xl text-ink">{acts.total}</p>
          <p className="mt-1.5 text-xs text-ink-soft">
            {t("Regnes ut automatisk: {e} arrangementer hittil i år + {p} faste tilbud (hvert teller som én aktivitet).", { e: acts.events, p: acts.programs })}
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">{t("Deltakere før nettsiden / utenfor rapportene")}
          </label>
          <input
            name="participants"
            type="number"
            defaultValue={get("participants")}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
          <p className="mt-1.5 text-xs text-ink-soft">{t("I tillegg summeres deltakere fra aktiviteter og faste tilbud automatisk (")}{auto}{t("). Forsiden viser totalt")}{" "}<strong>{get("participants") + auto}</strong>.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">{t("Frivillige timer")}
          </label>
          <p className="mb-1.5 text-xs text-ink-soft">{t("Timer før nettsiden / utenfor registreringene.")}
          </p>
          <input
            name="volunteer_hours"
            type="number"
            defaultValue={get("volunteer_hours")}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
          <p className="mt-1.5 text-xs text-ink-soft">{t("I tillegg regnes timer fra faste tilbud og aktiviteter ut automatisk (")}{autoHours}{t("). Forsiden viser totalt")}{" "}<strong>{get("volunteer_hours") + autoHours}</strong>.
          </p>
        </div>
        <button
          type="submit"
          className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >{t("Lagre")}
        </button>
      </form>
    </div>
  );
}
