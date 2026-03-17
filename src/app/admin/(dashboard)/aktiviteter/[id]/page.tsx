import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateActivity } from "../actions";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (!activity) notFound();

  const updateWithId = updateActivity.bind(null, id);

  return (
    <div>
      <Link href="/admin/aktiviteter" className="text-sm text-ink-soft hover:text-ink">
        ← Tilbake til aktiviteter
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">
        Rediger aktivitet
      </h1>

      <form
        action={updateWithId}
        className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <input
          name="title"
          required
          defaultValue={activity.title}
          placeholder="Tittel"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="category"
          required
          defaultValue={activity.category}
          placeholder="Kategori (f.eks. Kultur)"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="event_date"
          type="date"
          required
          defaultValue={activity.event_date}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="place"
          required
          defaultValue={activity.place}
          placeholder="Sted"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <textarea
          name="description"
          required
          defaultValue={activity.description}
          placeholder="Kort beskrivelse"
          rows={2}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig sm:col-span-2"
        />

        {activity.image_url && (
          <div className="sm:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.image_url}
              alt=""
              className="h-24 w-24 rounded-lg object-cover"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Nytt bilde (valgfritt – erstatter gjeldende)
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Ny video (valgfritt – erstatter gjeldende)
          </label>
          <input
            name="video"
            type="file"
            accept="video/*"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">
            Lenke til Facebook/Instagram-innlegg (valgfritt)
          </label>
          <input
            name="external_link"
            type="url"
            defaultValue={activity.external_link ?? ""}
            placeholder="https://facebook.com/..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >
          Lagre endringer
        </button>
      </form>
    </div>
  );
}
