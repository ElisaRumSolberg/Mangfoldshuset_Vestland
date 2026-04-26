import PhotosField from "../PhotosField";
import type { Utvalg } from "@/lib/utvalg";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";

export default function UtvalgForm({
  action,
  utvalg,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  utvalg?: Utvalg;
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
          defaultValue={utvalg?.title}
          placeholder="F.eks. Kvinneutvalget"
          className={field}
        />
        {utvalg ? (
          <p className="mt-1 text-xs text-ink-soft">
            Side: /utvalg/{utvalg.slug} (adressen endres ikke selv om du endrer navnet)
          </p>
        ) : (
          <p className="mt-1 text-xs text-ink-soft">
            Adressen til siden lages automatisk ut fra navnet.
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className={label}>Hva utvalget gjør</label>
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={utvalg?.description}
          placeholder="Kort om hva utvalget er og hva de gjør"
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>
          Forsidebilder (valgfritt – vises ved siden av tittelen øverst på
          siden; flere bilder glir automatisk over i hverandre)
        </label>
        <PhotosField initial={utvalg?.cover_images ?? []} folder="utvalg" name="cover_images" />
      </div>

      <div>
        <label className={label}>
          Vis deres aktiviteter (valgfritt – ord fra aktivitetens kategori)
        </label>
        <input
          name="activity_match"
          defaultValue={utvalg?.activity_match ?? ""}
          placeholder="f.eks. ungdom"
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Aktiviteter med dette ordet i kategorien vises på utvalgets side.
        </p>
      </div>
      <div>
        <label className={label}>Kontakt-e-post (valgfritt)</label>
        <input
          name="contact"
          type="email"
          defaultValue={utvalg?.contact ?? ""}
          className={field}
        />
      </div>

      <div>
        <label className={label}>Lenke til Facebook (valgfritt)</label>
        <input
          name="external_link"
          type="url"
          defaultValue={utvalg?.external_link ?? ""}
          placeholder="https://facebook.com/..."
          className={field}
        />
      </div>
      <div>
        <label className={label}>Lenke til Instagram (valgfritt)</label>
        <input
          name="instagram_link"
          type="url"
          defaultValue={utvalg?.instagram_link ?? ""}
          placeholder="https://instagram.com/..."
          className={field}
        />
      </div>

      <fieldset className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-white/60 p-4 sm:col-span-2 sm:grid-cols-3">
        <legend className="px-2 text-sm font-medium text-ink">
          Egen fargeprofil (valgfritt)
        </legend>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-3">
          <input
            type="checkbox"
            name="use_custom_colors"
            defaultChecked={!!(utvalg?.color_from && utvalg?.color_to && utvalg?.accent)}
            className="h-4 w-4 accent-fig"
          />
          Bruk egne farger for denne siden (f.eks. hentet fra en logo)
        </label>
        <p className="text-xs text-ink-soft sm:col-span-3">
          Uavhukt bruker siden standardfargene (grønn/rød).
        </p>
        <div>
          <label className={label}>Bakgrunn, fra</label>
          <input
            name="color_from"
            type="color"
            defaultValue={utvalg?.color_from ?? "#586B4F"}
            className="h-10 w-full rounded border border-line bg-white"
          />
        </div>
        <div>
          <label className={label}>Bakgrunn, til</label>
          <input
            name="color_to"
            type="color"
            defaultValue={utvalg?.color_to ?? "#48583F"}
            className="h-10 w-full rounded border border-line bg-white"
          />
        </div>
        <div>
          <label className={label}>Knapper/glød</label>
          <input
            name="accent"
            type="color"
            defaultValue={utvalg?.accent ?? "#9C3B44"}
            className="h-10 w-full rounded border border-line bg-white"
          />
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <label className={label}>Bilder</label>
        <PhotosField initial={utvalg?.photos ?? []} folder="utvalg" />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input
          name="active"
          type="checkbox"
          defaultChecked={utvalg?.active ?? true}
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
