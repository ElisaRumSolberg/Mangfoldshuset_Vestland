import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { addActivity, deleteActivity } from "./actions";
import FileUpload from "../FileUpload";
import CategoryPicker from "../CategoryPicker";
import AdminActivityList from "./AdminActivityList";

export default async function AdminAktiviteterPage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("event_date", { ascending: true });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Aktiviteter")}</h1>

      <form
        action={addActivity}
        className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <label><span className="mb-1 block text-sm font-medium text-ink">{t("Tittel")}</span><input
          name="title"
          required
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        /></label>
        <div className="sm:col-span-2">
          <p className="mb-1 text-sm font-medium text-ink">{t("Kategori (velg én eller flere)")}
          </p>
          <CategoryPicker />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">{t("Startdato")}</label>
          <input
            name="event_date"
            type="date"
            required
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">{t("Sluttdato (valgfritt – for flerdagers aktiviteter)")}
          </label>
          <input
            name="end_date"
            type="date"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <label><span className="mb-1 block text-sm font-medium text-ink">{t("Klokkeslett (valgfritt)")}</span><input
          name="event_time"
          placeholder="18.00–20.00"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        /></label>
        <label><span className="mb-1 block text-sm font-medium text-ink">{t("Sted")}</span><input
          name="place"
          required
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        /></label>
        <label className="sm:col-span-2"><span className="mb-1 block text-sm font-medium text-ink">{t("Pris (valgfritt)")}</span><input
          name="price"
          placeholder={t("Gratis, eller 100 kr")}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        /></label>
        <label className="sm:col-span-2"><span className="mb-1 block text-sm font-medium text-ink">{t("Kort beskrivelse")}</span><textarea
          name="description"
          required
          rows={2}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        /></label>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">{t("Bilde")}
          </label>
          <FileUpload name="image_url" folder="aktiviteter" accept="image/*" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">{t("Video (valgfritt)")}
          </label>
          <FileUpload name="video_url" folder="aktiviteter" accept="video/*" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">{t("Lenke til Facebook/Instagram-innlegg (valgfritt)")}
          </label>
          <input
            name="external_link"
            type="url"
            placeholder="https://facebook.com/..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">{t("Ansvarlig (valgfritt – vises nederst på aktiviteten)")}
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label><span className="mb-1 block text-sm font-medium text-ink">{t("Navn")}</span><input
              name="responsible_name"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            /></label>
            <label><span className="mb-1 block text-sm font-medium text-ink">{t("Telefon")}</span><input
              name="responsible_phone"
              type="tel"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            /></label>
            <label><span className="mb-1 block text-sm font-medium text-ink">{t("E-post")}</span><input
              name="responsible_email"
              type="email"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            /></label>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="registration_open"
            type="checkbox"
            defaultChecked={false}
            className="h-4 w-4 accent-fig"
          />{t("Åpne for påmelding – vis skjema på aktivitetens side")}
        </label>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={false}
            className="h-4 w-4 accent-fig"
          />{t("Fremhevet – vis øverst i «Kommende aktiviteter»")}
        </label>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="show_on_homepage"
            type="checkbox"
            defaultChecked={false}
            className="h-4 w-4 accent-fig"
          />{t("Vis bilde i karusellen på forsiden")}
        </label>

        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >{t("Legg til aktivitet")}
        </button>
      </form>

      <div className="mt-8">
        <AdminActivityList items={activities ?? []} deleteAction={deleteActivity} />
      </div>
    </div>
  );
}
