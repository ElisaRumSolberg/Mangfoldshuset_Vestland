import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { paymentsCsv, type PaymentRow } from "@/lib/payments-report";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (roleFromUser(user) !== "owner") return new Response("Ikke tilgang", { status: 403 });

  const yearParam = new URL(request.url).searchParams.get("year") ?? "";
  const year = /^\d{4}$/.test(yearParam) ? Number(yearParam) : new Date().getFullYear();

  const { data, error } = await supabase
    .from("member_payments")
    .select("id, covers_year, amount, method, paid_at, members(id, first_name, last_name, birth_date, gender)")
    .gte("paid_at", `${year}-01-01`)
    .lte("paid_at", `${year}-12-31`)
    .order("paid_at", { ascending: true });
  if (error) return new Response("Kunne ikke hente betalinger", { status: 503 });

  const rows: PaymentRow[] = (data ?? []).map((r) => {
    const m = Array.isArray(r.members) ? r.members[0] : r.members;
    return { id: r.id, covers_year: r.covers_year, amount: r.amount, method: r.method, paid_at: r.paid_at, member: m ?? null };
  });

  return new Response(paymentsCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="betalinger-${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
