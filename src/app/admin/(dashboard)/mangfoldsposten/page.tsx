import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addIssue, deleteIssue } from "./actions";

export default async function AdminMangfoldspostenPage() {
  const supabase = await createClient();
  const { data: issues } = await supabase
    .from("magazine_issues")
    .select("*")
    .order("issue_date", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">
        Mangfoldsposten
      </h1>

      <form
        action={addIssue}
        className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <input
          name="title"
          required
          placeholder="Tittel (f.eks. Høst 2026)"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="issue_date"
          type="date"
          required
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Forsidebilde
          </label>
          <input
            name="cover"
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            PDF
          </label>
          <input
            name="pdf"
            type="file"
            accept="application/pdf"
            required
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >
          Publiser utgave
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-3">
        {issues?.length ? (
          issues.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between rounded-xl border border-line bg-cream px-5 py-4"
            >
              <div className="flex items-center gap-4">
                {i.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={i.cover_image_url}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    {i.title}
                  </p>
                  <p className="text-sm text-ink-soft">{i.issue_date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={i.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Åpne PDF
                </a>
                <Link
                  href={`/admin/mangfoldsposten/${i.id}`}
                  className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Rediger
                </Link>
                <form action={deleteIssue.bind(null, i.id)}>
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
          <p className="text-sm text-ink-soft">Ingen utgaver ennå.</p>
        )}
      </div>
    </div>
  );
}
