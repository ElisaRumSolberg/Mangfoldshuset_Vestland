import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isVippsConfigured } from "@/lib/vipps";
import { settleByReference } from "@/lib/vipps-server";

/** Nattlig avstemming: plukker opp Vipps-betalinger som ble godkjent men aldri ble registrert (f.eks. lukket nettleser). */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!isVippsConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ skipped: "Vipps er ikke satt opp" });
  }

  const supabase = createAdminClient();
  const since = new Date(Date.now() - 3 * 86400000).toISOString();
  const { data, error } = await supabase
    .from("vipps_payments")
    .select("reference")
    .in("status", ["created", "authorized"])
    .gte("created_at", since)
    .limit(100);
  if (error) return NextResponse.json({ error: "Kunne ikke hente betalinger" }, { status: 503 });

  const { data: gifts } = await supabase
    .from("vipps_donations")
    .select("reference")
    .in("status", ["created", "authorized"])
    .gte("created_at", since)
    .limit(100);

  const counts: Record<string, number> = {};
  for (const { reference } of [...(data ?? []), ...(gifts ?? [])]) {
    const r = await settleByReference(reference);
    counts[r] = (counts[r] ?? 0) + 1;
  }
  return NextResponse.json({ checked: (data?.length ?? 0) + (gifts?.length ?? 0), ...counts });
}
