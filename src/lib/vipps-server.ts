import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient, isResendConfigured } from "@/lib/resend";
import { todayOslo } from "@/lib/recurring";
import { isDonationReference, vippsEnv } from "@/lib/vipps";
import { settleVippsDonation, settleVippsPayment, type SettleResult } from "@/lib/vipps-settle";

export const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mangfoldshusetvestland.no";

/** Kjører avstemmingen med ekte tilkoblinger (Supabase, Vipps, Resend). Kaster aldri. */
export async function settleByReference(reference: string): Promise<SettleResult> {
  const cfg = vippsEnv();
  if (!cfg || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return "unknown";
  try {
    if (isDonationReference(reference)) {
      return await settleVippsDonation(reference, { supabase: createAdminClient(), cfg });
    }
    return await settleVippsPayment(reference, {
      supabase: createAdminClient(),
      cfg,
      today: todayOslo(),
      site: SITE(),
      sendMail: isResendConfigured()
        ? (to, message) =>
            getResendClient().emails.send({
              from: "Mangfoldshuset Vestland <post@mangfoldshusetvestland.no>",
              to,
              ...message,
            })
        : undefined,
    });
  } catch {
    return "pending";
  }
}
