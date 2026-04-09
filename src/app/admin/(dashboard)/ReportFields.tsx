import PhotosField from "./PhotosField";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";

/** Felt for «Slik gikk det»: deltakere, oppsummering, tilbakemeldinger og bilder. */
export default function ReportFields({
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
  return (
    <fieldset className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-white/60 p-4 sm:col-span-2 sm:grid-cols-2">
      <legend className="px-2 font-serif text-lg text-ink">{heading}</legend>

      <div>
        <label className={label}>{participantsLabel}</label>
        <input
          name="participants"
          type="number"
          min={0}
          step={1}
          defaultValue={defaults.participants ?? ""}
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Telles automatisk med i «Deltakere» på forsiden.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Oppsummering (hva skjedde?)</label>
        <textarea
          name="summary"
          rows={3}
          defaultValue={defaults.summary ?? ""}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>
          Tilbakemeldinger (ett utsagn per linje – uten navn)
        </label>
        <textarea
          name="feedback"
          rows={4}
          defaultValue={defaults.feedback ?? ""}
          placeholder={"Veldig hyggelig, vi kommer igjen!\nFint å møte naboer."}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>
          Bilder (bare bilder der alle avbildede har samtykket – foresatte for barn)
        </label>
        <PhotosField initial={defaults.photos} folder={folder} />
      </div>
    </fieldset>
  );
}
