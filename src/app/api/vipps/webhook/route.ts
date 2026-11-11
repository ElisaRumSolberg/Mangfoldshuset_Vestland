import { NextResponse } from "next/server";
import { isDonationReference, isReference } from "@/lib/vipps";
import { settleByReference } from "@/lib/vipps-server";

/**
 * Vipps varsler her om at en betaling har endret status. Innholdet stoles det ikke på: vi henter bare
 * referansen og spør Vipps selv om status (samme avstemming som retursiden), så en forfalsket forespørsel
 * ikke kan registrere noen betaling. Svarer alltid 200 slik at Vipps ikke prøver i det uendelige.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reference?: unknown };
    if (isReference(body.reference) || isDonationReference(body.reference)) await settleByReference(body.reference);
  } catch {
    // Ugyldig innhold ignoreres.
  }
  return NextResponse.json({ ok: true });
}
