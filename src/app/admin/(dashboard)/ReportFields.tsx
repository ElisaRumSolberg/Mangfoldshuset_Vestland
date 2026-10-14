import { getT } from "@/lib/admin-i18n-server";
import PhotosField from "./PhotosField";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";

/** Felt for «Slik gikk det»: deltakere, oppsummering, tilbakemeldinger og bilder. */
export default async function ReportFields({
  heading,
  participantsLabel,
  folder,
  defaults,
}: {
  heading: string;
  participantsLabel: string;
  folder: string;
  defaults: {
    participants: number | null;
    summary: string | null;
    feedback: string | null;
    photos: string[];
  };
}) {
  const t = await getT();
  return (
    <fieldset className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-white/60 p-4 sm:col-span-2 sm:grid-cols-2">
      <legend className="px-2 font-serif text-lg text-ink">{t(heading)}</legend>

      <div>
        <label className={label}>{t(participantsLabel)}</label>
        <input
          name="participants"
          type="number"
          min={0}
          step={1}
          defaultValue={defaults.participants ?? ""}
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">{t("Telles automatisk med i «Deltakere» på forsiden.")}
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className={label}>{t("Oppsummering (hva skjedde?)")}</label>
        <p className="mb-1.5 text-xs text-ink-soft">{t("Skriv noen få setninger om hva som skjedde. Vises på aktivitetens side og på utvalgets side.")}
        </p>
        <textarea
          name="summary"
          rows={3}
          defaultValue={defaults.summary ?? ""}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>{t("Tilbakemeldinger (ett utsagn per linje – uten navn)")}
        </label>
        <p className="mb-1.5 text-xs text-ink-soft">{t("Trykk Enter for å starte en ny linje. Hver linje blir ett sitat på nettsiden. Skriv bare det deltakerne faktisk har sagt.")}
        </p>
        <textarea
          name="feedback"
          rows={4}
          defaultValue={defaults.feedback ?? ""}
          placeholder={t("Veldig hyggelig, vi kommer igjen!\nFint å møte naboer.")}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>{t("Bilder (bare bilder der alle avbildede har samtykket – foresatte for barn)")}
        </label>
        <PhotosField initial={defaults.photos} folder={folder} />
      </div>
    </fieldset>
  );
}
