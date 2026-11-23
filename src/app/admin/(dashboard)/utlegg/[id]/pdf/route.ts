import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { expenseToPdf, pdfFileName, type ExpenseFull } from "@/lib/expense-document";

export const dynamic = "force-dynamic";

/** Utleggsskjemaet som PDF. Owner ser alle; innleveren (editor) bare sine egne (RLS passer på det). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Ikke funnet", { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = roleFromUser(user);
  if (role !== "owner" && role !== "editor") return new Response("Ikke tilgang", { status: 403 });

  const { data } = await supabase.from("expenses").select("*").eq("id", id).maybeSingle();
  if (!data) return new Response("Ikke funnet", { status: 404 });
  const row = data as ExpenseFull;

  const pdf = await expenseToPdf(supabase, row);
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${pdfFileName(row)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
