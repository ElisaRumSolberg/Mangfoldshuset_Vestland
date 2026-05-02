import FileUpload from "../FileUpload";
import ReportFields from "../ReportFields";
import { NTH_OPTIONS, WEEKDAY_OPTIONS, type Program } from "@/lib/recurring";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";

export default function TilbudForm({
  action,
  program,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  program?: Program;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label className={label}>Navn</label>
        <input
          name="title"
          required
          defaultValue={program?.title}
          placeholder="F.eks. Barseltreff"
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Beskrivelse</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={program?.description}
          placeholder="Kort om hva tilbudet er og hvem det er for"
          className={field}
        />
      </div>

      <div>
        <label className={label}>Hvor ofte</label>
        <select name="frequency" defaultValue={program?.frequency ?? "weekly"} className={field}>
          <option value="weekly">Hver uke</option>
          <option value="monthly">Hver måned</option>
        </select>
      </div>
      <div>
        <label className={label}>Ukedag</label>
        <select name="weekday" defaultValue={program?.weekday ?? 5} className={field}>
          {WEEKDAY_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className={label}>
          Hvilken uke i måneden (bare for «Hver måned», f.eks. siste søndag)
        </label>
        <select name="nth" defaultValue={program?.nth ?? -1} className={field}>
          {NTH_OPTIONS.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Starter kl.</label>
        <input
          name="start_time"
          type="time"
          defaultValue={program?.start_time ?? ""}
          className={field}
        />
      </div>
      <div>
        <label className={label}>Slutter kl. (valgfritt)</label>
        <input
          name="end_time"
          type="time"
          defaultValue={program?.end_time ?? ""}
          className={field}
        />
      </div>

      <div>
        <label className={label}>Første dato (valgfritt, f.eks. oppstart)</label>
        <input
          name="start_date"
          type="date"
          defaultValue={program?.start_date ?? ""}
          className={field}
        />
      </div>
      <div>
        <label className={label}>Siste dato (valgfritt, hvis tilbudet avsluttes)</label>
        <input
          name="end_date"
          type="date"
          defaultValue={program?.end_date ?? ""}
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Sted</label>
        <input
          name="place"
          required
          defaultValue={program?.place}
          placeholder="Mangfoldhuset, Arne Abrahamsens vei 1, 5161 Laksevåg"
          className={field}
        />
      </div>

      <div>
        <label className={label}>Merknad (valgfritt)</label>
        <input
          name="note"
          defaultValue={program?.note ?? ""}
          placeholder="Ingen påmelding – bare kom"
          className={field}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Ansvarlig (valgfritt – vises nederst på kortet)</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            name="responsible_name"
            defaultValue={program?.responsible_name ?? ""}
            placeholder="Navn"
            className={field}
          />
          <input
            name="responsible_phone"
            type="tel"
            defaultValue={program?.responsible_phone ?? ""}
            placeholder="Telefon"
            className={field}
          />
          <input
            name="contact"
            type="email"
            defaultValue={program?.contact ?? ""}
            placeholder="E-post"
            className={field}
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Lenke til Facebook/Instagram (valgfritt)</label>
        <input
          name="external_link"
          type="url"
          defaultValue={program?.external_link ?? ""}
          placeholder="https://facebook.com/..."
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>
          Avlyste datoer (valgfritt – skriv ÅÅÅÅ-MM-DD, skill med komma)
        </label>
        <input
          name="skipped_dates"
          defaultValue={program?.skipped_dates?.join(", ") ?? ""}
          placeholder="2026-10-16, 2026-12-25"
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>
          {program?.image_url
            ? "Ny plakat (valgfritt – erstatter gjeldende)"
            : "Plakat (valgfritt)"}
        </label>
        {program?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={program.image_url} alt="" className="mb-2 h-24 rounded-lg object-cover" />
        )}
        <FileUpload name="image_url" folder="tilbud" accept="image/*" />
      </div>

      {program && (
        <ReportFields
          heading="Bilder og tilbakemeldinger"
          participantsLabel="Deltakere totalt så langt (samlet antall besøk)"
          folder="tilbud"
          defaults={{
            participants: program.participants,
            summary: program.summary,
            feedback: program.feedback,
            photos: program.photos,
          }}
        />
      )}

      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={program?.featured ?? false}
          className="h-4 w-4 accent-fig"
        />
        Fremhevet – vis øverst (til du fjerner haken)
      </label>

      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input
          name="active"
          type="checkbox"
          defaultChecked={program?.active ?? true}
          className="h-4 w-4 accent-fig"
        />
        Vis på nettsiden
      </label>

      <button
        type="submit"
        className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
