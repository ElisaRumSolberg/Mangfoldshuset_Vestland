import { createClient } from "@/lib/supabase/server";
import { deleteMessage } from "./actions";

export default async function AdminMeldingerPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">
        Kontaktmeldinger
      </h1>

      <div className="mt-8 flex flex-col gap-3">
        {messages?.length ? (
          messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-line bg-cream p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-base font-semibold text-ink">
                    {m.subject}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {m.name} · {m.email} ·{" "}
                    {new Date(m.created_at).toLocaleString("nb-NO")}
                  </p>
                </div>
                <form action={deleteMessage.bind(null, m.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-fig hover:text-fig"
                  >
                    Slett
                  </button>
                </form>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {m.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">Ingen meldinger ennå.</p>
        )}
      </div>
    </div>
  );
}
