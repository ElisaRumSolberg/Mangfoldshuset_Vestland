import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addNews, deleteNews } from "./actions";

export default async function AdminNyheterPage() {
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">Nyheter</h1>

      <form
        action={addNews}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6"
      >
        <input
          name="title"
          required
          placeholder="Overskrift"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <textarea
          name="summary"
          required
          placeholder="Kort sammendrag"
          rows={3}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Bilde
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
              Video (valgfritt)
            </label>
            <input
              name="video"
              type="file"
              accept="video/*"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
          </div>
        </div>
        <div>
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
        <button
          type="submit"
          className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >
          Publiser nyhet
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-3">
        {news?.length ? (
          news.map((n) => (
            <div
              key={n.id}
              className="flex items-center justify-between rounded-xl border border-line bg-cream px-5 py-4"
            >
              <div className="flex items-center gap-4">
                {n.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.image_url}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    {n.title}
                    {n.video_url ? " (video)" : ""}
                  </p>
                  <p className="text-sm text-ink-soft">{n.published_at}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/nyheter/${n.id}`}
                  className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Rediger
                </Link>
                <form action={deleteNews.bind(null, n.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
                  >
                    Slett
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">Ingen nyheter ennå.</p>
        )}
      </div>
    </div>
  );
}
