import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { longDateRange } from "@/lib/activity-date";

// Delekort (Facebook, WhatsApp, Messenger …) for en aktivitet: plakaten til venstre, tittel til høyre.
export const alt = "Aktivitet – Mangfoldshuset Vestland";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#EFE1CF";

async function posterDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const type = (res.headers.get("content-type") ?? "").split(";")[0];
    // ImageResponse leser PNG, JPEG og GIF (ikke WebP).
    if (!res.ok || !/^image\/(png|jpe?g|gif)$/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let title = "Mangfoldshuset Vestland";
  let when = "";
  let place = "";
  let poster: string | null = null;

  if (isSupabaseConfigured() && /^[0-9a-f-]{36}$/i.test(id)) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activities")
      .select("title,event_date,end_date,place,image_url")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      title = String(data.title ?? title);
      place = String(data.place ?? "");
      try {
        when = longDateRange(data);
      } catch {
        when = "";
      }
      if (data.image_url) poster = await posterDataUri(String(data.image_url));
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          color: "#3A281E",
        }}
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" width={440} height={630} style={{ width: 440, height: 630, objectFit: "contain" }} />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 56px",
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 2, color: "#9C3B44", textTransform: "uppercase" }}>
            Mangfoldshuset Vestland
          </div>
          <div style={{ fontSize: poster ? 54 : 72, fontWeight: 700, lineHeight: 1.15, marginTop: 20 }}>
            {title}
          </div>
          {when && <div style={{ fontSize: 34, marginTop: 28 }}>{when}</div>}
          {place && <div style={{ fontSize: 28, marginTop: 8, color: "#6B5A4E" }}>{place}</div>}
          <div style={{ fontSize: 28, marginTop: 36, color: "#9C3B44", fontWeight: 700 }}>
            Les mer: mangfoldshusetvestland.no
          </div>
        </div>
      </div>
    ),
    size
  );
}
