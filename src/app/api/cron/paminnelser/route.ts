import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";

// Dager til utløp (positivt = før, negativt = etter utløp).
const MILESTONES = [30, 21, 15, 10, 5, 3, 1, -3, -7, -15];

function message(firstName: string, expires: string, offset: number) {
  const vipps = "Betal medlemskontingent med Vipps til #595791.";
  if (offset > 0) {
    return {
      subject: `Medlemskapet ditt utløper om ${offset} ${offset === 1 ? "dag" : "dager"}`,
      text: `Hei ${firstName}!\n\nMedlemskapet ditt i Mangfoldhuset Vestland gjelder til ${expires} (${offset} ${offset === 1 ? "dag" : "dager"} igjen). ${vipps}\n\nTakk for at du er med i fellesskapet!\nMangfoldhuset Vestland`,
    };
  }
  const ago = -offset;
  return {
    subject: `Medlemskapet ditt utløp for ${ago} dager siden`,
    text: `Hei ${firstName}!\n\nMedlemskapet ditt i Mangfoldhuset Vestland utløp ${expires} (${ago} dager siden). Vi vil gjerne ha deg med videre! ${vipps}\n\nMangfoldhuset Vestland`,
  };
}

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
  const from = process.env.RESEND_FROM ?? "Mangfoldhuset Vestland <onboarding@resend.dev>";

  const todayMs = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const day = 86400000;
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  const { data: candidates } = await supabase
    .from("members")
    .select("*")
    .gte("expires_at", iso(todayMs - 15 * day))
    .lte("expires_at", iso(todayMs + 30 * day));

  const summary: string[] = [];

  for (const m of candidates ?? []) {
    const offset = Math.round((new Date(m.expires_at).getTime() - todayMs) / day);
    if (!MILESTONES.includes(offset)) continue;
    if (m.last_reminder_for === m.expires_at && m.last_reminder_offset === offset) continue;

    const { subject, text } = message(m.first_name, m.expires_at, offset);
    const { error } = await resend.emails.send({
      from,
      to: m.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      text,
    });
    if (error) continue;

    await supabase
      .from("members")
      .update({ last_reminder_for: m.expires_at, last_reminder_offset: offset })
      .eq("id", m.id);
    summary.push(`${m.first_name} ${m.last_name} – ${offset > 0 ? `${offset} dager igjen` : `utløpt for ${-offset} dager siden`}`);
  }

  if (summary.length) {
    await resend.emails.send({
      from,
      to: NOTIFY_EMAIL,
      subject: `${summary.length} medlemspåminnelser sendt`,
      text: summary.join("\n"),
    });
  }

  return NextResponse.json({ reminded: summary.length });
}
