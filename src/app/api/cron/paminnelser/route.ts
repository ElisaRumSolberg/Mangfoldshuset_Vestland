import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, isResendConfigured, NOTIFY_EMAIL } from "@/lib/resend";
import { todayOslo } from "@/lib/recurring";
import { isVippsPublic } from "@/lib/vipps";
import { feeStartsText, freeMembershipEnd, FEE_STARTS } from "@/lib/membership-year";
import { feeForPerson } from "@/lib/membership-fee";

// Dager til utløp (positivt = før, negativt = etter utløp).
const MILESTONES = [30, 21, 15, 10, 5, 3, 1, -3, -7, -15];

function message(firstName: string, expires: string, offset: number, link: string, birthDate?: string | null) {
  const vipps = isVippsPublic()
    ? `Betal kontingenten med Vipps direkte på din medlemsside: ${link}`
    : `Betal medlemskontingent med Vipps til #595791. Din medlemsside: ${link}`;
  // Gratis medlemskap ut 2026: forklar at kontingenten innføres, og hva det koster for akkurat denne personen.
  if (expires === freeMembershipEnd() && offset > 0) {
    const fee = feeForPerson(birthDate, FEE_STARTS);
    const how = isVippsPublic()
      ? `Du fornyer enkelt med Vipps på din medlemsside: ${link}`
      : `Du fornyer ved å betale til Vipps #595791 eller bankkonto 3207 31 01688, og skriver navnet ditt. Din medlemsside: ${link}`;
    return {
      subject: "Fornye medlemskapet fra 1. januar?",
      text: `Hei ${firstName}!

Medlemskapet ditt i Mangfoldshuset Vestland har vært gratis i 2026, og gjelder til ${expires} (${offset} ${offset === 1 ? "dag" : "dager"} igjen). Fra ${feeStartsText()} koster medlemskap ${fee} kr per år. ${how}

Takk for at du er med i fellesskapet!
Mangfoldshuset Vestland`,
    };
  }
  if (offset > 0) {
    return {
      subject: `Medlemskapet ditt utløper om ${offset} ${offset === 1 ? "dag" : "dager"}`,
      text: `Hei ${firstName}!\n\nMedlemskapet ditt i Mangfoldshuset Vestland gjelder til ${expires} (${offset} ${offset === 1 ? "dag" : "dager"} igjen). ${vipps}\n\nTakk for at du er med i fellesskapet!\nMangfoldshuset Vestland`,
    };
  }
  const ago = -offset;
  return {
    subject: `Medlemskapet ditt utløp for ${ago} dager siden`,
    text: `Hei ${firstName}!\n\nMedlemskapet ditt i Mangfoldshuset Vestland utløp ${expires} (${ago} dager siden). Vi vil gjerne ha deg med videre! ${vipps}\n\nMangfoldshuset Vestland`,
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
  const from = process.env.RESEND_FROM ?? "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>";

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";
  const todayMs = new Date(`${todayOslo()}T00:00:00Z`).getTime();
  const day = 86400000;
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

  const { data: candidates, error: queryError } = await supabase
    .from("members")
    .select("*")
    .gte("expires_at", iso(todayMs - 15 * day))
    .lte("expires_at", iso(todayMs + 30 * day));
  if (queryError) return NextResponse.json({ error: "Kunne ikke hente påminnelser" }, { status: 503 });

  const summary: string[] = [];

  for (const m of candidates ?? []) {
    const offset = Math.round((new Date(m.expires_at).getTime() - todayMs) / day);
    if (!MILESTONES.includes(offset)) continue;
    if (m.last_reminder_for === m.expires_at && m.last_reminder_offset === offset) continue;

    const { subject, text } = message(m.first_name, m.expires_at, offset, `${site}/bli-med/medlem/${m.pay_token}`, m.birth_date);
    const { error } = await resend.emails.send({
      from,
      to: m.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      text,
    }, { idempotencyKey: `membership-${m.id}-${m.expires_at}-${offset}` });
    if (error) continue;

    const { error: updateError } = await supabase
      .from("members")
      .update({ last_reminder_for: m.expires_at, last_reminder_offset: offset })
      .eq("id", m.id);
    if (updateError) return NextResponse.json({ error: "Kunne ikke lagre påminnelsesstatus" }, { status: 503 });
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
