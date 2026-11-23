import Link from "next/link";
import { getT } from "@/lib/admin-i18n-server";
import { createClient } from "@/lib/supabase/server";
import { todayOslo } from "@/lib/recurring";
import { loadExpenseTargets } from "@/lib/expense-targets";
import ExpenseForm from "../ExpenseForm";
import { submitExpense } from "../actions";

export default async function NewExpensePage() {
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const targets = await loadExpenseTargets(supabase, todayOslo());
  const defaultName = typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : "";

  return (
    <div>
      <Link href="/admin/utlegg" className="text-sm font-semibold text-fig underline underline-offset-4">
        ← {t("Tilbake til utlegg")}
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-medium text-ink">{t("Nytt utlegg")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        {t("Fyll ut hva du har kjøpt, og legg ved bilde av kvitteringen. Beløpet regnes om til NOK automatisk. Når du sender, får regnskapsføreren en kopi.")}
      </p>
      <ExpenseForm
        action={submitExpense}
        defaultName={defaultName}
        today={todayOslo()}
        programs={targets.programs}
        activities={targets.activities}
      />
    </div>
  );
}
