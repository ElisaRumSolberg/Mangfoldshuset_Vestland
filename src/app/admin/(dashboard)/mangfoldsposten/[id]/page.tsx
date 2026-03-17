import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateIssue } from "../actions";

export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: issue } = await supabase
    .from("magazine_issues")
    .select("*")
    .eq("id", id)
    .single();

  if (!issue) notFound();

  const updateWithId = updateIssue.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/mangfoldsposten"
        className="text-sm text-ink-soft hover:text-ink"
      >
        ← Tilbake til Mangfoldsposten
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">
        Rediger utgave
      </h1>

      <form
        action={updateWithId}
        className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <input
          name="title"
          required
          defaultValue={issue.title}
          placeholder="Tittel (f.eks. Høst 2026)"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="issue_date"
          type="date"
          required
          defaultValue={issue.issue_date}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />

        {issue.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={issue.cover_image_url}
            alt=""
            className="h-24 w-24 rounded-lg object-cover sm:col-span-2"
          />
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Nytt forsidebilde (valgfritt – erstatter gjeldende)
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
            Ny PDF (valgfritt – erstatter gjeldende)
          </label>
          <input
            name="pdf"
            type="file"
            accept="application/pdf"
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
