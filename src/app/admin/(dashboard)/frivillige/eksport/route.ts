import { createClient } from "@/lib/supabase/server";
import { roleFromUser } from "@/lib/roles";
import { volunteersCsv, type Volunteer } from "@/lib/volunteers";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (roleFromUser(user) !== "owner") return new Response("Ikke tilgang", { status: 403 });

  const { data, error } = await supabase.from("volunteers").select("*").order("name", { ascending: true });
  if (error) return new Response("Kunne ikke hente frivillige", { status: 503 });

  return new Response(volunteersCsv((data ?? []) as Volunteer[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="frivillige.csv"',
      "Cache-Control": "no-store",
    },
  });
}
