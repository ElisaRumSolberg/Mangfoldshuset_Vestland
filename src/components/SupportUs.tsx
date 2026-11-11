import { isVippsConfigured } from "@/lib/vipps";
import { startVippsDonation } from "@/app/stott-oss/actions";

const AMOUNTS = [100, 250, 500, 1000];

export default function SupportUs({ vippsLink }: { vippsLink?: string | null }) {
  const direct = isVippsConfigured();
  return (
    <section id="stott-oss" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-24">
      <div className="flex flex-col items-center gap-8 rounded-[20px] bg-gradient-to-br from-[#6E8B67] to-[#3F5A3E] px-8 py-12 text-center text-white sm:px-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">
            Støtt oss
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-white">
            Din støtte gjør en forskjell
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
            Alt vi gjør er mulig takket være frivillige og støttespillere. Et
            bidrag – stort eller lite – går rett til aktivitetene våre i
            lokalsamfunnet.
          </p>
        </div>

        {direct && (
          <form action={startVippsDonation} className="w-full max-w-md text-left">
            <fieldset>
              <legend className="mb-3 text-center text-sm font-semibold text-white">Velg beløp</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {AMOUNTS.map((a, i) => (
                  <label key={a} className="cursor-pointer">
                    <input type="radio" name="amount" value={a} defaultChecked={i === 1} className="peer sr-only" />
                    <span className="flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-black/15 px-3 text-base font-semibold text-white transition-colors peer-checked:border-white peer-checked:bg-white peer-checked:text-[#33482F] peer-focus-visible:ring-2 peer-focus-visible:ring-white">
                      {a} kr
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="cursor-pointer">
                  <input type="radio" name="amount" value="annet" className="peer sr-only" />
                  <span className="flex min-h-12 items-center rounded-xl border border-white/40 bg-black/15 px-4 text-base font-semibold text-white transition-colors peer-checked:border-white peer-checked:bg-white peer-checked:text-[#33482F] peer-focus-visible:ring-2 peer-focus-visible:ring-white">
                    Annet beløp
                  </span>
                </label>
                <input
                  name="custom"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="kr"
                  aria-label="Annet beløp i kroner"
                  className="min-h-12 w-full min-w-0 rounded-xl border border-white/40 bg-white px-4 text-base text-ink outline-none focus:border-white"
                />
              </div>
            </fieldset>
            <button
              type="submit"
              className="mt-5 w-full rounded-2xl px-10 py-5 text-center shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#FF5B24" }}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide text-white/80">Vipps</span>
              <span className="mt-1 block font-serif text-2xl font-medium text-white">Gi med Vipps</span>
            </button>
          </form>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          {direct ? null : vippsLink ? (
            <a
              href={vippsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl px-10 py-5 text-center shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#FF5B24" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Vipps
              </p>
              <p className="mt-1 font-serif text-2xl font-medium text-white">
                Gi med Vipps
              </p>
            </a>
          ) : (
            <div className="rounded-2xl px-10 py-5 shadow-lg" style={{ backgroundColor: "#FF5B24" }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1A1512]">
                Vipps
              </p>
              <p className="mt-1 font-serif text-2xl font-medium text-white">
                #595791
              </p>
            </div>
          )}
          <div className="rounded-2xl border border-white/40 bg-black/15 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
              Bankkonto
            </p>
            <p className="mt-1 font-serif text-2xl font-medium text-white">
              3207 31 01688
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
