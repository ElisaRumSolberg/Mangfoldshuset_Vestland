import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { todayOslo } from "@/lib/recurring";
import {
  UNPAID_BASE,
  UNPAID_WINDOW_DAYS,
  nextUnpaidMilestone,
  unpaidMessage,
} from "@/lib/unpaid-reminders";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !isResendConfigured()) {
    return NextResponse.json({ error: "Mangler SUPABASE_SERVICE_ROLE_KEY eller RESEND_API_KEY" }, { status: 500 });
  }

  const supabase = createAdminClient();
  const resend = getResendClient();
  const from = process.env.RESEND_FROM ?? "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>";

  const todayMs = new Date(`${todayOslo()}T00:00:00Z`).getTime();
  const day = 86400000;
  const since = new Date(todayMs - UNPAID_WINDOW_DAYS * day).toISOString();

  const { data: candidates, error: queryError } = await supabase
    .from("members")
    .select("*")
    .is("expires_at", null)
    .is("paid_at", null)
    .gte("created_at", since);
  if (queryError) return NextResponse.json({ error: "Kunne ikke hente medlemmer" }, { status: 503 });

  const summary: string[] = [];

  for (const m of candidates ?? []) {
    const createdMs = new Date(String(m.created_at).slice(0, 10) + "T00:00:00Z").getTime();
    const daysSince = Math.floor((todayMs - createdMs) / day);
    const milestone = nextUnpaidMilestone(daysSince, m.last_reminder_offset);
    if (milestone === null) continue;

    const { subject, text } = unpaidMessage(m.first_name, m.membership_type);
    const { error } = await resend.emails.send(
      { from, to: m.email, replyTo: NOTIFY_EMAIL, subject, text },
      { idempotencyKey: `unpaid-${m.id}-${milestone}` }
    );
    if (error) continue;

    const { error: updateError } = await supabase
      .from("members")
      .update({ last_reminder_offset: UNPAID_BASE + milestone })
      .eq("id", m.id);
    if (updateError) return NextResponse.json({ error: "Kunne ikke lagre påminnelsesstatus" }, { status: 503 });
    summary.push(`${m.first_name} ${m.last_name} – ${daysSince} dager siden innmelding`);
  }

  if (summary.length) {
    await resend.emails.send({
      from,
      to: NOTIFY_EMAIL,
      subject: `${summary.length} betalingspåminnelser sendt (ikke betalt)`,
      text: summary.join("\n"),
    });
  }

  return NextResponse.json({ reminded: summary.length });
}
