import { fetchSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "./actions";
import PhotosField from "../PhotosField";

export default async function AdminInnholdPage() {
  const settings = await fetchSiteSettings();

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Innhold</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Bilder som vises i stedet for det fargede designet på forsiden og Om
        oss-siden. Flere bilder glir automatisk over i hverandre.
      </p>

      <form
        action={updateSiteSettings}
        className="mt-8 grid grid-cols-1 gap-8 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Forsidebilder (hjemmesiden)
          </label>
          <PhotosField initial={settings.hero_images} folder="innhold" name="hero_images" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Bilder til Om oss
          </label>
          <PhotosField initial={settings.om_oss_images} folder="innhold" name="om_oss_images" />
        </div>

        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >
          Lagre bilder
        </button>
      </form>
    </div>
  );
}
