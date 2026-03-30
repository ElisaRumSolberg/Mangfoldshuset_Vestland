import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateNews } from "../actions";
import FileUpload from "../../FileUpload";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) notFound();

  const updateWithId = updateNews.bind(null, id);

  return (
    <div>
      <Link href="/admin/nyheter" className="text-sm text-ink-soft hover:text-ink">
        ← Tilbake til nyheter
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">
        Rediger nyhet
      </h1>

      <form
        action={updateWithId}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6"
      >
        <input
          name="title"
          required
          defaultValue={item.title}
          placeholder="Overskrift"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <textarea
          name="summary"
          required
          defaultValue={item.summary}
          placeholder="Kort sammendrag"
          rows={3}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />

        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="h-24 w-24 rounded-lg object-cover"
          />
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Nytt bilde (valgfritt – erstatter gjeldende)
            </label>
            <FileUpload name="image_url" folder="nyheter" accept="image/*" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Ny video (valgfritt – erstatter gjeldende)
            </label>
            <FileUpload name="video_url" folder="nyheter" accept="video/*" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Lenke til Facebook/Instagram-innlegg (valgfritt)
          </label>
          <input
            name="external_link"
            type="url"
            defaultValue={item.external_link ?? ""}
            placeholder="https://facebook.com/..."
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>

        <button
          type="submit"
          className="w-fit rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
        >
          Lagre endringer
        </button>
      </form>
    </div>
  );
}
