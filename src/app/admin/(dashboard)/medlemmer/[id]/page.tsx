import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/admin-i18n-server";
import { updateMember } from "../actions";

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";
const MAX_FAMILY = 5;

type Family = { name: string; birth_date: string | null; gender?: string | null };

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { id } = await params;
  const supabase = await createClient();
  const { data: m } = await supabase.from("members").select("*").eq("id", id).single();
  if (!m) notFound();

  const family: Family[] = Array.isArray(m.family_members) ? m.family_members : [];
  const rows = Array.from({ length: MAX_FAMILY }, (_, i) => family[i] ?? null);

  const genderOptions = (
    <>
      <option value="">{t("Ikke oppgitt")}</option>
      <option value="kvinne">{t("Kvinne")}</option>
      <option value="mann">{t("Mann")}</option>
      <option value="annet">{t("Annet")}</option>
      <option value="ukjent">{t("Ønsker ikke å oppgi")}</option>
    </>
  );

  return (
    <div>
      <Link href="/admin/medlemmer" className="text-sm text-ink-soft hover:text-ink">
        {t("← Tilbake til medlemmer")}
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">
        {t("Rediger medlem")}: {m.first_name} {m.last_name}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        {t("Betalingsstatus og utløpsdato endres med «Marker betalt / Forny» i medlemslisten.")}
      </p>

      <form
        action={updateMember.bind(null, id)}
        className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-6 sm:grid-cols-2"
      >
        <label>
          <span className={label}>{t("Fornavn")}</span>
          <input name="first_name" required defaultValue={m.first_name} className={field} />
        </label>
        <label>
          <span className={label}>{t("Etternavn")}</span>
          <input name="last_name" required defaultValue={m.last_name} className={field} />
        </label>
        <label>
          <span className={label}>{t("E-post")}</span>
          <input name="email" type="email" required defaultValue={m.email} className={field} />
        </label>
        <label>
          <span className={label}>{t("Telefon (valgfritt)")}</span>
          <input name="phone" defaultValue={m.phone ?? ""} className={field} />
        </label>
        <label>
          <span className={label}>{t("Fødselsdato")}</span>
          <input name="birth_date" type="date" defaultValue={m.birth_date ?? ""} className={field} />
        </label>
        <label>
          <span className={label}>{t("Kjønn (valgfritt)")}</span>
          <select name="gender" defaultValue={m.gender ?? ""} className={field}>
            {genderOptions}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={label}>{t("Adresse (valgfritt)")}</span>
          <input name="address" defaultValue={m.address ?? ""} className={field} />
        </label>
        <label>
          <span className={label}>{t("Type medlemskap")}</span>
          <select name="membership_type" defaultValue={m.membership_type ?? "enkelt"} className={field}>
            <option value="enkelt">{t("Enkelt person (100 kr)")}</option>
            <option value="familie">{t("Familie (150 kr)")}</option>
          </select>
        </label>

        <fieldset className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-white/60 p-4 sm:col-span-2">
          <legend className="px-2 font-serif text-lg text-ink">{t("Familiemedlemmer")}</legend>
          <p className="text-xs text-ink-soft">
            {t("La navnet stå tomt for å fjerne en person. Opptil 5 personer.")}
          </p>
          {rows.map((f, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                name={`fam_name_${i + 1}`}
                defaultValue={f?.name ?? ""}
                aria-label={t("Person {n}: navn", { n: i + 1 })}
                placeholder={t("Person {n}: navn", { n: i + 1 })}
                className={field}
              />
              <input
                name={`fam_birth_${i + 1}`}
                type="date"
                defaultValue={f?.birth_date ?? ""}
                aria-label={t("Person {n}: fødselsdato", { n: i + 1 })}
                className={field}
              />
              <select
                name={`fam_gender_${i + 1}`}
                defaultValue={f?.gender ?? ""}
                aria-label={t("Person {n}: kjønn", { n: i + 1 })}
                className={field}
              >
                {genderOptions}
              </select>
            </div>
          ))}
        </fieldset>

        <button
          type="submit"
          className="min-h-11 w-fit rounded-full bg-fig px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2"
        >
          {t("Lagre endringer")}
        </button>
      </form>
    </div>
  );
}
