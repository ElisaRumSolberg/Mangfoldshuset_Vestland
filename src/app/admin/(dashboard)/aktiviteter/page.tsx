import { createClient } from "@/lib/supabase/server";
import { addActivity, deleteActivity } from "./actions";
import FileUpload from "../FileUpload";
import CategoryPicker from "../CategoryPicker";
import AdminActivityList from "./AdminActivityList";

export default async function AdminAktiviteterPage() {
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("event_date", { ascending: true });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Aktiviteter</h1>

      <form
        action={addActivity}
        className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <input
          name="title"
          required
          placeholder="Tittel"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">
            Kategori (velg én eller flere)
          </label>
          <CategoryPicker />
        </div>
        <input
          name="event_date"
          type="date"
          required
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="place"
          required
          placeholder="Sted"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <textarea
          name="description"
          required
          placeholder="Kort beskrivelse"
          rows={2}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig sm:col-span-2"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Bilde
          </label>
          <FileUpload name="image_url" folder="aktiviteter" accept="image/*" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Video (valgfritt)
          </label>
          <FileUpload name="video_url" folder="aktiviteter" accept="video/*" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">
            Lenke til Facebook/Instagram-innlegg (valgfritt)
          </label>
          <input
            name="external_link"
            type="url"
            placeholder="https://facebook.com/..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">
            Ansvarlig (valgfritt – vises nederst på aktiviteten)
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              name="responsible_name"
              placeholder="Navn"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
            <input
              name="responsible_phone"
              type="tel"
              placeholder="Telefon"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
            <input
              name="responsible_email"
              type="email"
              placeholder="E-post"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={false}
            className="h-4 w-4 accent-fig"
          />
          Fremhevet – vis øverst i «Kommende aktiviteter»
        </label>

        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >
          Legg til aktivitet
        </button>
      </form>

      <div className="mt-8">
        <AdminActivityList items={activities ?? []} deleteAction={deleteActivity} />
      </div>
    </div>
  );
}
