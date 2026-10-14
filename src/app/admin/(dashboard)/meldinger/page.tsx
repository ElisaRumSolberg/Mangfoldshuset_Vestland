import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { deleteMessage } from "./actions";
import DeleteButton from "../DeleteButton";

export default async function AdminMeldingerPage() {
  const t = await getT();
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-ink">{t("Kontaktmeldinger")}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">{t("Meldinger fra kontaktskjemaet på nettsiden. Du får også en kopi på e-post. Svar til avsenderens e-postadresse, og slett meldingen når du er ferdig.")}
      </p>

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
                  <DeleteButton what={t("meldingen fra {name}", { name: m.name })} />
                </form>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {m.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink-soft">{t("Ingen meldinger ennå.")}</p>
        )}
      </div>
    </div>
  );
}
