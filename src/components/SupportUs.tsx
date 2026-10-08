export default function SupportUs({ vippsLink }: { vippsLink?: string | null }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
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

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          {vippsLink ? (
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
