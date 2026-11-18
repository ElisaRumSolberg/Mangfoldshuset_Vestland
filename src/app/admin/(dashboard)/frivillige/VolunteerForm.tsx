import { getT } from "@/lib/admin-i18n-server";
import { STATUS_LABEL, VOLUNTEER_STATUSES, type Volunteer } from "@/lib/volunteers";

const field = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-fig";
const label = "mb-1 block text-sm font-medium text-ink";
const hint = "mt-1 text-xs text-ink-soft";

/** Skjema for å legge til eller endre en frivillig. */
export default async function VolunteerForm({
  action,
  submitLabel,
  volunteer,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  volunteer?: Volunteer;
}) {
  const t = await getT();
  return (
    <form action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="v-name" className={label}>{t("Navn")} *</label>
        <input id="v-name" name="name" required defaultValue={volunteer?.name ?? ""} className={field} />
      </div>
      <div>
        <label htmlFor="v-email" className={label}>{t("E-post")}</label>
        <input id="v-email" name="email" type="email" defaultValue={volunteer?.email ?? ""} className={field} />
      </div>
      <div>
        <label htmlFor="v-phone" className={label}>{t("Telefon")}</label>
        <input id="v-phone" name="phone" type="tel" defaultValue={volunteer?.phone ?? ""} className={field} />
      </div>
      <div>
        <label htmlFor="v-status" className={label}>{t("Status")}</label>
        <select id="v-status" name="status" defaultValue={volunteer?.status ?? "aktiv"} className={field}>
          {VOLUNTEER_STATUSES.map((s) => (
            <option key={s} value={s}>{t(STATUS_LABEL[s])}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="v-programs" className={label}>{t("Hjelper på")}</label>
        <input id="v-programs" name="programs" defaultValue={volunteer?.programs ?? ""} className={field} placeholder="Torsdagssuppe, Leksehjelp" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="v-interests" className={label}>{t("Interesser")}</label>
        <input id="v-interests" name="interests" defaultValue={volunteer?.interests.join(", ") ?? ""} className={field} placeholder="Mat og servering, Barn og unge" />
        <p className={hint}>{t("Skill med komma.")}</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="v-availability" className={label}>{t("Når kan de")}</label>
        <input id="v-availability" name="availability" defaultValue={volunteer?.availability.join(", ") ?? ""} className={field} placeholder="Hverdager på kveldstid, Helger" />
        <p className={hint}>{t("Skill med komma.")}</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="v-note" className={label}>{t("Notat")}</label>
        <textarea id="v-note" name="note" rows={3} defaultValue={volunteer?.note ?? ""} className={field} />
      </div>
      <button type="submit" className="w-fit rounded-lg bg-fig px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark sm:col-span-2">
        {submitLabel}
      </button>
    </form>
  );
}
