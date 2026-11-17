import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { fetchPrograms, todayOslo } from "@/lib/recurring";
import { fetchWeekActivities } from "@/lib/week-load";
import { addDaysIso, buildWeek, parseWeekParam, tintFor } from "@/lib/week-program";

/**
 * Plakaten «Det skjer i uke N», laget av de samme dataene som resten av nettsiden, slik at tider og steder
 * alltid stemmer. ?uke=ÅÅÅÅ-MM-DD (en dato i uken) og ?format=instagram|story|facebook. ?last=1 gir en nedlasting.
 */

const FORMATS = {
  instagram: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  facebook: { width: 1200, height: 1800 },
} as const;
type Format = keyof typeof FORMATS;

const PAPER = "#FAF6EF";
const INK = "#33312C";
const SOFT = "#5B5750";
const LINE = "#E4DCC9";
const FIG = "#9C3B44";
const GREEN = "#4B6B4A";

const fontDir = join(process.cwd(), "src/assets/fonts");
let fontsPromise: Promise<{ lora500: Buffer; lora700: Buffer; inter400: Buffer; inter600: Buffer }> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(fontDir, "lora-latin-500-normal.woff")),
    readFile(join(fontDir, "lora-latin-700-normal.woff")),
    readFile(join(fontDir, "inter-latin-400-normal.woff")),
    readFile(join(fontDir, "inter-latin-600-normal.woff")),
  ]).then(([lora500, lora700, inter400, inter600]) => ({ lora500, lora700, inter400, inter600 }));
  return fontsPromise;
}

let bandPromise: Promise<string> | null = null;
function loadBand() {
  bandPromise ??= readFile(join(process.cwd(), "public/ukeplakat-logoer.png"), "base64").then((b) => `data:image/png;base64,${b}`);
  return bandPromise;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const formatParam = url.searchParams.get("format") ?? "instagram";
  const format: Format = (formatParam in FORMATS ? formatParam : "instagram") as Format;
  const { width, height } = FORMATS[format];
  const story = format === "story";

  const today = todayOslo();
  const start = parseWeekParam(url.searchParams.get("uke") ?? undefined, today);
  const programs = await fetchPrograms();
  const week = buildWeek(programs, await fetchWeekActivities(start, addDaysIso(start, 6)), start);
  const [fonts, band] = await Promise.all([loadFonts(), loadBand()]);

  // Mål som følger formatet.
  const titleSize = story ? 120 : 104;
  const dayText = story ? 40 : 34;
  const itemText = story ? 40 : 34;
  const placeText = story ? 26 : 23;
  const pillText = story ? 34 : 29;
  const pad = 56;
  const bandHeight = Math.round(((width - pad * 2) * 217) / 1000);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", padding: `${story ? 90 : 52}px ${pad}px 0` }}>
          <div style={{ display: "flex", fontFamily: "Lora", fontSize: story ? 44 : 38, color: GREEN }}>Det skjer i</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontFamily: "Lora", fontWeight: 700, fontSize: titleSize, lineHeight: 1.05, color: FIG }}>uke {week.number}</div>
            <div style={{ display: "flex", fontSize: story ? 34 : 30, color: SOFT }}>{week.label}</div>
          </div>
          <div style={{ display: "flex", height: 4, width: 220, background: GREEN, marginTop: 14, borderRadius: 2 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 14, padding: `${story ? 40 : 28}px ${pad}px` }}>
          {week.days.length === 0 ? (
            <div style={{ display: "flex", fontSize: 34, color: SOFT }}>Ingen faste tilbud denne uken.</div>
          ) : (
            week.days.map((day) => (
              <div
                key={day.iso}
                style={{
                  display: "flex",
                  flexGrow: day.items.length,
                  flexBasis: 0,
                  alignItems: "center",
                  gap: 24,
                  background: "#FFFFFF",
                  border: `2px solid ${LINE}`,
                  borderRadius: 24,
                  padding: "10px 26px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", width: story ? 190 : 170 }}>
                  <div style={{ display: "flex", fontFamily: "Lora", fontWeight: 700, fontSize: dayText + 4 }}>{day.name}</div>
                  <div style={{ display: "flex", fontSize: placeText, color: SOFT }}>{day.dateText}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                  {day.items.map((item) => {
                    const tint = tintFor(item.title);
                    const label = item.note === "avlyst" ? "Avlyst" : item.note === "starter" ? `Starter uke ${item.startsWeek}` : item.time ?? "";
                    return (
                      <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                          <div style={{ display: "flex", width: 14, height: 44, borderRadius: 7, background: tint.solid }} />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", fontWeight: 600, fontSize: itemText, lineHeight: 1.15 }}>{item.title}</div>
                            {item.place && <div style={{ display: "flex", fontSize: placeText, color: SOFT }}>{item.place}</div>}
                          </div>
                        </div>
                        {label && (
                          <div
                            style={{
                              display: "flex",
                              background: item.note === "avlyst" ? "#FFFFFF" : tint.solid,
                              color: item.note === "avlyst" ? FIG : "#FFFFFF",
                              border: item.note === "avlyst" ? `2px solid ${FIG}` : "none",
                              fontWeight: 600,
                              fontSize: pillText,
                              borderRadius: 40,
                              padding: "6px 22px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#F5E4CE", padding: `14px ${pad}px ${story ? 70 : 22}px` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={band} alt="" width={width - pad * 2} height={bandHeight} style={{ width: width - pad * 2, height: bandHeight }} />
          <div style={{ display: "flex", fontFamily: "Lora", fontWeight: 700, fontSize: 32, color: GREEN, marginTop: 6 }}>mangfoldshusetvestland.no</div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Lora", data: fonts.lora500, weight: 400, style: "normal" },
        { name: "Lora", data: fonts.lora700, weight: 700, style: "normal" },
        { name: "Inter", data: fonts.inter400, weight: 400, style: "normal" },
        { name: "Inter", data: fonts.inter600, weight: 600, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        ...(url.searchParams.get("last") === "1"
          ? { "Content-Disposition": `attachment; filename="ukens-program-uke-${week.number}-${format}.png"` }
          : {}),
      },
    },
  );
}
