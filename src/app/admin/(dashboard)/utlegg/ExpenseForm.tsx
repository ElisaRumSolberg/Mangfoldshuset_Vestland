"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/admin/AdminLang";
import SignaturePad from "./SignaturePad";
import {
  MAX_RECEIPTS,
  UNITS,
  fmtMoney,
  parseNumber,
  round2,
} from "@/lib/expenses";

const field = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";
const hint = "mt-1 text-xs text-ink-soft";
const MAX_FILE_MB = 10;
const OTHER = "__annet";
const PROFILE_KEY = "utlegg-opplysninger";

type Row = { id: number; item: string; qty: string; unit: string; unitPrice: string };
type Receipt = { id: number; name: string; path?: string; state: "uploading" | "done" | "error"; message?: string };

const emptyRow = (id: number): Row => ({ id, item: "", qty: "1", unit: "stk", unitPrice: "" });

/** Store mobilbilder krympes litt før opplasting, så kvitteringene ikke fyller lagringen. */
async function shrink(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 2200;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

type UploadTarget = { path: string; token: string } | { error: "kode" | "feil" };

export default function ExpenseForm({
  action,
  defaultName,
  today,
  programs,
  activities,
  publicMode,
  uploadTarget,
  extra,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultName: string;
  today: string;
  /** Faste tilbud (Leksehjelp, Torsdagssuppe …) og nyere aktiviteter, som valg for «hva gjelder utlegget». */
  programs: string[];
  activities: string[];
  /** Skjemaet for frivillige uten konto: fellesord, e-post og telefon, og opplasting via serveren. */
  publicMode?: boolean;
  uploadTarget?: (code: string, ext: string) => Promise<UploadTarget>;
  /** Ekstra skjulte felt (spam-felt) fra serverkomponenten. */
  extra?: React.ReactNode;
}) {
  const t = useT();
  const nextId = useRef(2);
  const nextReceipt = useRef(1);
  const currency = "NOK";
  const [rows, setRows] = useState<Row[]>([emptyRow(1)]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [noReceipt, setNoReceipt] = useState(false);
  const [code, setCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [choice, setChoice] = useState("");
  const [custom, setCustom] = useState("");
  const [preview, setPreview] = useState(false);
  const [snap, setSnap] = useState<Record<string, string>>({});
  const [signature, setSignature] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [remember, setRemember] = useState(true);

  // Fyll inn opplysningene fra forrige gang (lagret bare i denne nettleseren).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}") as Record<string, string>;
      const form = formRef.current;
      if (!form) return;
      for (const [name, value] of Object.entries(saved)) {
        const el = form.elements.namedItem(name);
        if (el instanceof HTMLInputElement && !el.value && typeof value === "string") el.value = value;
      }
    } catch {
      // Ingen lagrede opplysninger, eller nettleseren tillater det ikke.
    }
  }, []);
  const purpose = choice === OTHER ? custom.trim() : choice;

  const total = round2(
    rows.reduce((sum, r) => {
      const q = parseNumber(r.qty);
      const p = parseNumber(r.unitPrice);
      return sum + (q !== null && p !== null ? q * p : 0);
    }, 0),
  );
  const uploading = receipts.some((r) => r.state === "uploading");

  function setRow(id: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    const supabase = createClient();
    let userId = "";
    if (publicMode) {
      if (!code.trim()) {
        setReceipts((rs) => [...rs, { id: nextReceipt.current++, name: files[0].name, state: "error", message: t("Skriv inn fellesordet først.") }]);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setReceipts((rs) => [...rs, { id: nextReceipt.current++, name: files[0].name, state: "error", message: t("Du er ikke logget inn. Last inn siden på nytt.") }]);
        return;
      }
      userId = user.id;
    }

    for (const file of files) {
      if (receipts.filter((r) => r.state !== "error").length >= MAX_RECEIPTS) break;
      const rid = nextReceipt.current++;
      const entry: Receipt = { id: rid, name: file.name, state: "uploading" };
      setReceipts((rs) => [...rs, entry]);
      const update = (patch: Partial<Receipt>) =>
        setReceipts((rs) => rs.map((r) => (r.id === rid ? { ...r, ...patch } : r)));

      if (file.size > 40 * 1024 * 1024) {
        update({ state: "error", message: t("Filen er for stor.") });
        continue;
      }
      const blob = await shrink(file);
      if (blob.size > MAX_FILE_MB * 1024 * 1024) {
        update({ state: "error", message: t("Filen er over {max} MB.", { max: MAX_FILE_MB }) });
        continue;
      }
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const ext = isPdf ? "pdf" : blob === file ? (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg" : "jpg";
      const fileExt = ext.length >= 2 ? ext : "jpg";
      const contentType = blob.type || (isPdf ? "application/pdf" : undefined);
      if (publicMode && uploadTarget) {
        const target = await uploadTarget(code, fileExt);
        if ("error" in target) {
          update({ state: "error", message: target.error === "kode" ? t("Fellesordet stemmer ikke.") : t("Opplastingen feilet. Prøv igjen.") });
          continue;
        }
        const { error } = await supabase.storage.from("receipts").uploadToSignedUrl(target.path, target.token, blob, { contentType });
        if (error) update({ state: "error", message: t("Opplastingen feilet: {error}", { error: error.message }) });
        else update({ state: "done", path: target.path });
        continue;
      }
      const path = `${userId}/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from("receipts").upload(path, blob, { contentType });
      if (error) update({ state: "error", message: t("Opplastingen feilet: {error}", { error: error.message }) });
      else update({ state: "done", path });
    }
  }

  function removeReceipt(r: Receipt) {
    setReceipts((rs) => rs.filter((x) => x.id !== r.id));
  }

  const donePaths = receipts.filter((r) => r.state === "done" && r.path).map((r) => r.path as string);
  const needsReceipt = donePaths.length === 0 && !noReceipt;

  function showPreview() {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const fd = new FormData(form);
    const get = (k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string).trim() : "");
    const profile = { by_name: get("by_name"), by_email: get("by_email"), by_phone: get("by_phone"), by_address: get("by_address"), by_postcode: get("by_postcode"), by_account: get("by_account") };
    try {
      if (remember) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      else localStorage.removeItem(PROFILE_KEY);
    } catch {
      // Lagring er bare en bekvemmelighet.
    }
    setSnap({ name: profile.by_name, email: profile.by_email, phone: profile.by_phone, address: profile.by_address, postcode: profile.by_postcode, account: profile.by_account, date: get("expense_date"), description: get("description") });
    setPreview(true);
    window.scrollTo({ top: 0 });
  }

  const filled = rows.filter((r) => r.item.trim());

  return (
    <form ref={formRef} action={action} className="mt-6 flex flex-col gap-6">
      <input type="hidden" name="lines" value={JSON.stringify(rows.map(({ item, qty, unit, unitPrice }) => ({ item, qty, unit, unitPrice })))} />
      <input type="hidden" name="receipts" value={donePaths.join("\n")} />
      <input type="hidden" name="purpose" value={purpose} />
      <input type="hidden" name="signature" value={signature} />

      {preview && (
        <section aria-live="polite" className="rounded-xl border border-fig/40 bg-cream p-5">
          <h2 className="font-serif text-xl font-medium text-ink">{t("Kontroller før du sender")}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t("Se over at alt stemmer. Når du sender, kan du ikke endre utlegget selv.")}</p>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="font-semibold text-ink">{t("Gjelder")}</dt>
            <dd>{purpose}</dd>
            <dt className="font-semibold text-ink">{t("Dato for utlegget")}</dt>
            <dd>{snap.date}</dd>
            <dt className="font-semibold text-ink">{t("Ditt navn")}</dt>
            <dd>{snap.name}</dd>
            <dt className="font-semibold text-ink">{t("Adresse")}</dt>
            <dd>{snap.address}, {snap.postcode}</dd>
            <dt className="font-semibold text-ink">{t("Kontonummer til betaling")}</dt>
            <dd>{snap.account}</dd>
            {publicMode && (
              <>
                <dt className="font-semibold text-ink">{t("E-post")}</dt>
                <dd>{snap.email}</dd>
                {snap.phone && (
                  <>
                    <dt className="font-semibold text-ink">{t("Telefon")}</dt>
                    <dd>{snap.phone}</dd>
                  </>
                )}
              </>
            )}
            {snap.description && (
              <>
                <dt className="font-semibold text-ink">{t("Beskrivelse")}</dt>
                <dd className="whitespace-pre-line">{snap.description}</dd>
              </>
            )}
          </dl>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-white text-sm">
            {filled.map((r) => {
              const q = parseNumber(r.qty);
              const p = parseNumber(r.unitPrice);
              return (
                <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2">
                  <span>{r.item} <span className="text-ink-soft">· {r.qty} {t(r.unit)} × {fmtMoney(p ?? 0, currency)}</span></span>
                  <strong>{fmtMoney(q !== null && p !== null ? round2(q * p) : 0, currency)}</strong>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-right font-serif text-xl font-medium text-ink">{t("Totalt")}: {fmtMoney(total, currency)}</p>
          <p className="mt-3 text-sm text-ink-soft">
            {donePaths.length > 0 ? `${donePaths.length} ${t("kvittering(er)")}` : t("Ingen kvittering")}
          </p>
          {signature && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-ink">{t("Underskrift")}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signature} alt={t("Underskrift")} className="mt-1 h-20 rounded-lg border border-line bg-white" />
            </div>
          )}
        </section>
      )}

      <div className={preview ? "hidden" : "flex flex-col gap-6"}>
      {extra}

      {publicMode && (
        <section className="rounded-xl border border-line bg-cream p-5">
          <label htmlFor="e-code" className={label}>{t("Fellesord")} *</label>
          <input id="e-code" name="code" required value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" className={field} />
          <p className={hint}>{t("Ordet får du av regnskapsføreren eller styret.")}</p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="e-name" className={label}>{t("Ditt navn")} *</label>
          <input id="e-name" name="by_name" required defaultValue={defaultName} className={field} autoComplete="name" />
        </div>
        {publicMode && (
          <>
            <div>
              <label htmlFor="e-email" className={label}>{t("E-post")} *</label>
              <input id="e-email" name="by_email" type="email" required className={field} autoComplete="email" />
              <p className={hint}>{t("Du får beskjed her når utlegget er behandlet.")}</p>
            </div>
            <div>
              <label htmlFor="e-phone" className={label}>{t("Telefon")}</label>
              <input id="e-phone" name="by_phone" type="tel" className={field} autoComplete="tel" />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label htmlFor="e-address" className={label}>{t("Adresse")} *</label>
          <input id="e-address" name="by_address" required maxLength={200} className={field} autoComplete="street-address" />
        </div>
        <div>
          <label htmlFor="e-postcode" className={label}>{t("Postnummer")} *</label>
          <input id="e-postcode" name="by_postcode" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} className={field} autoComplete="postal-code" />
        </div>
        <div>
          <label htmlFor="e-account" className={label}>{t("Kontonummer til betaling")} *</label>
          <input id="e-account" name="by_account" required inputMode="numeric" maxLength={16} className={field} placeholder="1234.56.78903" autoComplete="off" />
          <p className={hint}>{t("11 siffer. Brukes bare til å betale tilbake utlegget.")}</p>
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-soft sm:col-span-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-1" />
          <span>{t("Husk opplysningene mine på denne enheten til neste gang")}</span>
        </label>
        <div>
          <label htmlFor="e-date" className={label}>{t("Dato for utlegget")} *</label>
          <input id="e-date" name="expense_date" type="date" required max={today} defaultValue={today} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="e-purpose" className={label}>{t("Hvilken aktivitet er utlegget for?")} *</label>
          <select id="e-purpose" required value={choice} onChange={(e) => setChoice(e.target.value)} className={field}>
            <option value="">{t("Velg aktivitet")}</option>
            {programs.length > 0 && (
              <optgroup label={t("Faste tilbud")}>
                {programs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </optgroup>
            )}
            {activities.length > 0 && (
              <optgroup label={t("Aktiviteter")}>
                {activities.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </optgroup>
            )}
            <option value={OTHER}>{t("Annet / generelt (skriv selv)")}</option>
          </select>
          {choice === OTHER && (
            <input
              aria-label={t("Skriv hva utlegget gjelder")}
              required
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className={`${field} mt-2`}
              placeholder={t("Skriv hva utlegget gjelder")}
              maxLength={200}
            />
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="e-desc" className={label}>{t("Beskrivelse (valgfritt)")}</label>
          <textarea id="e-desc" name="description" rows={2} className={field} />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-cream p-5">
        <h2 className="font-serif text-lg font-medium text-ink">{t("Hva ble kjøpt?")}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((r, i) => {
            const q = parseNumber(r.qty);
            const p = parseNumber(r.unitPrice);
            return (
              <li key={r.id} className="rounded-lg border border-line bg-white p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
                  <div className="col-span-2 sm:col-span-5">
                    <label htmlFor={`l-item-${r.id}`} className={label}>{t("Vare eller tjeneste")} {i + 1}</label>
                    <input id={`l-item-${r.id}`} value={r.item} onChange={(e) => setRow(r.id, { item: e.target.value })} className={field} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`l-qty-${r.id}`} className={label}>{t("Antall")}</label>
                    <input id={`l-qty-${r.id}`} inputMode="decimal" value={r.qty} onChange={(e) => setRow(r.id, { qty: e.target.value })} className={field} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={`l-unit-${r.id}`} className={label}>{t("Enhet")}</label>
                    <select id={`l-unit-${r.id}`} value={r.unit} onChange={(e) => setRow(r.id, { unit: e.target.value })} className={field}>
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{t(u)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <label htmlFor={`l-price-${r.id}`} className={label}>{t("Pris per enhet")} ({currency})</label>
                    <input id={`l-price-${r.id}`} inputMode="decimal" value={r.unitPrice} onChange={(e) => setRow(r.id, { unitPrice: e.target.value })} className={field} />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink-soft">
                    {t("Sum")}: <strong className="text-ink">{q !== null && p !== null ? fmtMoney(round2(q * p), currency) : "–"}</strong>
                  </span>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} className="min-h-11 px-2 text-sm text-ink-soft underline underline-offset-4 hover:text-fig">
                      {t("Fjern linjen")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, emptyRow(nextId.current++)])}
          className="mt-3 min-h-11 rounded-lg border border-fig px-5 text-sm font-semibold text-fig transition-colors hover:bg-fig hover:text-white"
        >
          + {t("Legg til en linje")}
        </button>

        <div className="mt-5 border-t border-line pt-4 text-right">
          <p className="font-serif text-xl font-medium text-ink">{t("Totalt")}: {fmtMoney(total, currency)}</p>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg font-medium text-ink">{t("Kvittering eller faktura")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("Ta et bilde av kvitteringen eller velg en PDF. Du kan legge til flere.")}</p>
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={onFiles}
          aria-label={t("Velg kvittering")}
          className="mt-3 block w-full text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-fig file:px-5 file:text-sm file:font-semibold file:text-white"
        />
        {receipts.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {receipts.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2">
                <span className="min-w-0 truncate">
                  {r.state === "uploading" && `⏳ ${r.name} …`}
                  {r.state === "done" && `✓ ${r.name}`}
                  {r.state === "error" && <span className="text-fig">✗ {r.name}: {r.message}</span>}
                </span>
                <button type="button" onClick={() => removeReceipt(r)} className="shrink-0 text-ink-soft underline underline-offset-4 hover:text-fig">
                  {t("Fjern")}
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="no_receipt" checked={noReceipt} onChange={(e) => setNoReceipt(e.target.checked)} className="mt-1" />
          <span>{t("Jeg har ingen kvittering (forklar i beskrivelsen over)")}</span>
        </label>
      </section>

      <section>
        <h2 className="font-serif text-lg font-medium text-ink">{t("Underskrift")}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t("Skriv under med finger, penn eller mus.")}</p>
        <div className="mt-3">
          <SignaturePad onChange={setSignature} />
        </div>
        <label className="mt-3 flex items-start gap-2 text-sm text-ink">
          <input type="checkbox" name="confirm" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1" />
          <span>{t("Jeg bekrefter at opplysningene er riktige og at utlegget er betalt av meg.")}</span>
        </label>
      </section>

      </div>

      <div>
        {preview ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="min-h-12 rounded-lg bg-fig px-7 text-sm font-semibold text-white transition-colors hover:bg-fig-dark"
            >
              {t("Send inn utlegget")}
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview(false);
                window.scrollTo({ top: 0 });
              }}
              className="min-h-12 rounded-lg border border-line px-6 text-sm font-semibold text-ink-soft transition-colors hover:border-fig hover:text-fig"
            >
              {t("Tilbake og rediger")}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={showPreview}
              disabled={uploading || needsReceipt || !signature}
              className="min-h-12 rounded-lg bg-fig px-7 text-sm font-semibold text-white transition-colors hover:bg-fig-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("Se over før du sender")}
            </button>
            {uploading && <p className={hint}>{t("Vent til opplastingen er ferdig.")}</p>}
            {!uploading && needsReceipt && <p className={hint}>{t("Legg ved kvittering, eller huk av for at du ikke har noen.")}</p>}
            {!uploading && !needsReceipt && !signature && <p className={hint}>{t("Skriv under i feltet over før du går videre.")}</p>}
          </>
        )}
      </div>
    </form>
  );
}
