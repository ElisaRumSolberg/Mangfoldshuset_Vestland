import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { expensesCsv, type ExpenseRow } from "@/lib/expenses";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (roleFromUser(user) !== "owner") return new Response("Ikke tilgang", { status: 403 });

  const yearParam = new URL(request.url).searchParams.get("year") ?? "";
  const year = /^\d{4}$/.test(yearParam) ? Number(yearParam) : null;

  let query = supabase.from("expenses").select("*").order("expense_date", { ascending: true });
  if (year) query = query.gte("expense_date", `${year}-01-01`).lte("expense_date", `${year}-12-31`);
  const { data, error } = await query;
  if (error) return new Response("Kunne ikke hente utlegg", { status: 503 });

  return new Response(expensesCsv((data ?? []) as ExpenseRow[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="utlegg${year ? `-${year}` : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
