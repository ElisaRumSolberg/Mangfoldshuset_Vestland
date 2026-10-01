import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateActivity, deleteSignup } from "../actions";
import FileUpload from "../../FileUpload";
import ReportFields from "../../ReportFields";
import CategoryPicker from "../../CategoryPicker";
import ShareBox from "../../ShareBox";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: activity }, { data: signups }] = await Promise.all([
    supabase.from("activities").select("*").eq("id", id).single(),
    supabase
      .from("activity_signups")
      .select("*")
      .eq("activity_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!activity) notFound();

  const updateWithId = updateActivity.bind(null, id);
  const totalParticipants = (signups ?? []).reduce((sum, s) => sum + (s.participants ?? 1), 0);

  return (
    <div>
      <Link href="/admin/aktiviteter" className="text-sm text-ink-soft hover:text-ink">
        ← Tilbake til aktiviteter
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">
        Rediger aktivitet
      </h1>

      <ShareBox
        url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/aktiviteter/${id}`}
      />

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
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-ink">
            Kategori (velg én eller flere)
          </label>
          <CategoryPicker initial={activity.categories ?? []} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Startdato</label>
          <input
            name="event_date"
            type="date"
            required
            defaultValue={activity.event_date}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Sluttdato (valgfritt – for flerdagers aktiviteter)
          </label>
          <input
            name="end_date"
            type="date"
            defaultValue={activity.end_date ?? ""}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
          />
        </div>
        <input
          name="event_time"
          defaultValue={activity.event_time ?? ""}
          placeholder="Klokkeslett (f.eks. 18.00–20.00)"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="place"
          required
          defaultValue={activity.place}
          placeholder="Sted"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <input
          name="price"
          defaultValue={activity.price ?? ""}
          placeholder="Pris (f.eks. Gratis, eller 100 kr)"
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig sm:col-span-2"
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
          <div className="flex items-center gap-3 sm:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.image_url}
              alt=""
              className="h-24 w-24 rounded-lg object-cover"
            />
            <label className="flex items-center gap-2 text-sm text-fig">
              <input type="checkbox" name="remove_image" className="h-4 w-4 accent-fig" />
              Fjern bildet
            </label>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Nytt bilde (valgfritt – erstatter gjeldende)
          </label>
          <FileUpload name="image_url" folder="aktiviteter" accept="image/*" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Ny video (valgfritt – erstatter gjeldende)
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
            defaultValue={activity.external_link ?? ""}
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
              defaultValue={activity.responsible_name ?? ""}
              placeholder="Navn"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
            <input
              name="responsible_phone"
              type="tel"
              defaultValue={activity.responsible_phone ?? ""}
              placeholder="Telefon"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
            <input
              name="responsible_email"
              type="email"
              defaultValue={activity.responsible_email ?? ""}
              placeholder="E-post"
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
            />
          </div>
        </div>

        <ReportFields
          heading="Slik gikk det (fylles ut etter arrangementet)"
          participantsLabel="Antall deltakere"
          folder="aktiviteter"
          defaults={{
            participants: activity.participants ?? null,
            summary: activity.summary ?? null,
            feedback: activity.feedback ?? null,
            photos: activity.photos ?? [],
          }}
        />

        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="registration_open"
            type="checkbox"
            defaultChecked={activity.registration_open ?? false}
            className="h-4 w-4 accent-fig"
          />
          Åpne for påmelding – vis skjema på aktivitetens side
        </label>

        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={activity.featured ?? false}
            className="h-4 w-4 accent-fig"
          />
          Fremhevet – vis øverst i «Kommende aktiviteter»
        </label>

        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            name="show_on_homepage"
            type="checkbox"
            defaultChecked={activity.show_on_homepage ?? false}
            className="h-4 w-4 accent-fig"
          />
          Vis bilde i karusellen på forsiden
        </label>

        {(() => {
          const choices = [
            ...(activity.image_url ? [{ url: activity.image_url as string, label: "Plakat" }] : []),
            ...((activity.photos as string[] | null) ?? []).map((url, i) => ({
              url,
              label: `Bilde ${i + 1}`,
            })),
          ];
          if (choices.length === 0) return null;
          const chosen: string[] = activity.homepage_image_urls ?? [];
          return (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-ink">
                Hvilke bilder skal vises i karusellen på forsiden? (velg én eller flere – ingen valgt = automatisk)
              </label>
              <div className="flex flex-wrap gap-3">
                {choices.map((c) => (
                  <label key={c.url} className="flex flex-col items-center gap-1 text-xs text-ink-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.url} alt={c.label} className="h-16 w-16 rounded-lg border border-line object-cover" />
                    <input
                      type="checkbox"
                      name="homepage_image_urls"
                      value={c.url}
                      defaultChecked={chosen.includes(c.url)}
                      className="accent-fig"
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })()}

        <button
          type="submit"
          className="rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2 sm:w-fit"
        >
          Lagre endringer
        </button>
      </form>

      <div className="mt-10">
        <h2 className="font-serif text-xl font-medium text-ink">
          Påmeldte {signups && signups.length > 0 && `(${signups.length} – ${totalParticipants} personer)`}
        </h2>
        {signups && signups.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {signups.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {s.name}{" "}
                    <span className="font-normal text-ink-soft">
                      · {s.participants} {s.participants === 1 ? "person" : "personer"}
                    </span>
                  </p>
                  <p className="text-sm text-ink-soft">
                    {s.email}
                    {s.phone ? ` · ${s.phone}` : ""} ·{" "}
                    {new Date(s.created_at).toLocaleString("nb-NO")}
                  </p>
                  {s.comment && (
                    <p className="mt-1 text-sm text-ink-soft">«{s.comment}»</p>
                  )}
                </div>
                <form action={deleteSignup.bind(null, id, s.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
                  >
                    Slett
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">Ingen påmeldte ennå.</p>
        )}
      </div>
    </div>
  );
}
