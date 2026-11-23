import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { STATUS_LABEL, STATUS_TINT, fmtMoney, isStatus, lineTotal, type ExpenseLine, type ExpenseRow } from "@/lib/expenses";
import DeleteButton from "../../DeleteButton";
import { decideExpense, deleteExpense } from "../actions";

const field = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = roleFromUser(user) === "owner";

  const { data } = await supabase.from("expenses").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const e = data as ExpenseRow & { lines: ExpenseLine[]; created_by: string };

  const { data: signed } = e.receipts.length
    ? await supabase.storage.from("receipts").createSignedUrls(e.receipts, 3600)
    : { data: [] };
  const files = (signed ?? []).flatMap((s) => (s.signedUrl ? [{ path: s.path, signedUrl: s.signedUrl }] : []));
  const canDelete = isOwner || (e.created_by === user?.id && e.status === "ny");

  return (
    <div>
      <Link href="/admin/utlegg" className="text-sm font-semibold text-fig underline underline-offset-4">
        ← {t("Tilbake til utlegg")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink">{e.purpose}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {e.expense_date} · {e.created_by_name ?? "–"}
            {e.created_by_email ? ` · ${e.created_by_email}` : ""}
            {e.created_by_phone ? ` · ${e.created_by_phone}` : ""}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_TINT[e.status] ?? ""}`}>
          {isStatus(e.status) ? t(STATUS_LABEL[e.status]) : e.status}
        </span>
      </div>

      {e.description && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm text-ink">{e.description}</p>}

      <section className="mt-6 overflow-x-auto rounded-xl border border-line bg-cream p-5">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="text-ink-soft">
              <th className="pb-2 font-medium">{t("Vare eller tjeneste")}</th>
              <th className="pb-2 text-right font-medium">{t("Antall")}</th>
              <th className="pb-2 text-right font-medium">{t("Pris per enhet")}</th>
              <th className="pb-2 text-right font-medium">{t("Sum")}</th>
            </tr>
          </thead>
          <tbody>
            {e.lines.map((l, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-2 pr-3">{l.item}</td>
                <td className="py-2 text-right">{l.qty} {t(l.unit)}</td>
                <td className="py-2 text-right">{fmtMoney(l.unitPrice, e.currency)}</td>
                <td className="py-2 text-right">{fmtMoney(lineTotal(l), e.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 border-t border-line pt-3 text-right">
          {e.currency !== "NOK" && (
            <p className="text-sm text-ink-soft">
              {fmtMoney(Number(e.total_original), e.currency)} · {t("kurs")} 1 NOK = {Number(e.exchange_rate)} {e.currency}
            </p>
          )}
          <p className="font-serif text-xl font-medium text-ink">{fmtMoney(Number(e.total_nok))}</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-lg font-medium text-ink">{t("Kvitteringer")}</h2>
        {e.no_receipt && <p className="mt-2 text-sm text-ink-soft">{t("Innleveren har ikke kvittering.")}</p>}
        {files.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {files.map((f, i) => {
              const isPdf = (f.path ?? "").toLowerCase().endsWith(".pdf");
              return (
                <li key={f.path ?? i}>
                  <a href={f.signedUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-line bg-white hover:border-fig">
                    {isPdf ? (
                      <span className="flex aspect-[3/4] items-center justify-center p-3 text-center text-sm font-semibold text-ink-soft">PDF · {t("Åpne")}</span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.signedUrl} alt={`${t("Kvittering")} ${i + 1}`} className="aspect-[3/4] w-full object-cover" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isOwner ? (
        <section className="mt-8 rounded-xl border border-line bg-cream p-5">
          <h2 className="font-serif text-lg font-medium text-ink">{t("Behandling")}</h2>
          {e.decision_note && <p className="mt-2 text-sm text-ink-soft">{t("Merknad")}: {e.decision_note}</p>}
          {e.decided_at && (
            <p className="mt-1 text-sm text-ink-soft">
              {t("Sist behandlet")} {e.decided_at.slice(0, 10)}
              {e.decided_by_email ? ` · ${e.decided_by_email}` : ""}
              {e.paid_at ? ` · ${t("utbetalt")} ${e.paid_at}` : ""}
            </p>
          )}
          <form action={decideExpense.bind(null, e.id)} className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="d-note" className="mb-1 block text-sm font-medium text-ink">{t("Merknad til innleveren (valgfritt)")}</label>
              <textarea id="d-note" name="decision_note" rows={2} defaultValue={e.decision_note ?? ""} className={field} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" name="decision" value="godkjent" className="min-h-11 rounded-lg bg-fig px-5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark">{t("Godkjenn")}</button>
              <button type="submit" name="decision" value="utbetalt" className="min-h-11 rounded-lg border border-fig px-5 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white">{t("Merk som utbetalt")}</button>
              <button type="submit" name="decision" value="avvist" className="min-h-11 rounded-lg border border-line px-5 text-sm font-semibold text-ink-soft transition-colors hover:border-fig hover:text-fig">{t("Avvis")}</button>
              {e.status !== "ny" && (
                <button type="submit" name="decision" value="ny" className="min-h-11 rounded-lg px-4 text-sm text-ink-soft underline underline-offset-4 hover:text-fig">{t("Sett tilbake til venter")}</button>
              )}
            </div>
            <p className="text-xs text-ink-soft">{t("Innleveren får en e-post når du godkjenner, utbetaler eller avviser.")}</p>
          </form>
        </section>
      ) : (
        e.decision_note && <p className="mt-6 text-sm text-ink-soft">{t("Merknad")}: {e.decision_note}</p>
      )}

      {canDelete && (
        <form action={deleteExpense.bind(null, e.id)} className="mt-8">
          <DeleteButton what={e.purpose} />
        </form>
      )}
    </div>
  );
}
