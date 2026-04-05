import { fetchSiteSettings } from "@/lib/site-settings";
import { updateSiteSettings } from "./actions";
import PhotosField from "../PhotosField";
import ShareBox from "../ShareBox";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const faste_lenker = [
  { label: "Hjemmeside", url: site },
  { label: "Bli medlem", url: `${site}/bli-med#medlem` },
  { label: "Bli frivillig", url: `${site}/bli-med#frivillig` },
  { label: "Facebook", url: "https://www.facebook.com/mangfoldhusetvestlandet/" },
  { label: "Instagram", url: "https://www.instagram.com/mangfoldhusetvestlandet/" },
];

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

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">
            Lenke til Vipps innsamling (valgfritt – erstatter Vipps-nummeret med en «Gi med Vipps»-knapp)
          </label>
          <input
            name="vipps_link"
            type="url"
            defaultValue={settings.vipps_link ?? ""}
            placeholder="https://vipps.no/i/..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >
          Lagre bilder
        </button>
      </form>

      <h2 className="mt-12 font-serif text-xl font-medium text-ink">
        Lenker og QR-koder til plakater
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Ferdige lenker og QR-koder til de vanligste stedene – klar til å lime
        inn i en plakat.
      </p>
      {faste_lenker.map((l) => (
        <ShareBox key={l.label} url={l.url} title={l.label} />
      ))}
    </div>
  );
}
