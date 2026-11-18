import { isVippsPublic } from "@/lib/vipps";
import { startVippsDonation } from "@/app/stott-oss/actions";
import DonationAmount from "@/components/DonationAmount";

const VIPPS = "#FF5B24";

/** Støtt oss: en rolig linje på siden, ikke en egen scene. Skjemaet vises bare når Vipps er satt opp. */
export default function SupportUs({ vippsLink }: { vippsLink?: string | null }) {
  const direct = isVippsPublic();
  return (
    <section id="stott-oss" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-16">
      <div className="grid grid-cols-1 gap-6 border-t border-line pt-10 md:grid-cols-[1fr_minmax(0,24rem)] md:items-center md:gap-14">
        <div>
          <h2 className="font-serif text-2xl font-medium">Støtt oss</h2>
          <p className="mt-2 max-w-md text-base leading-relaxed text-ink-soft">
            Et bidrag, stort eller lite, går rett til aktivitetene våre i lokalsamfunnet.
          </p>
        </div>

        <div>
          {direct ? (
            <form action={startVippsDonation}>
              <DonationAmount />
              <button
                type="submit"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg px-6 text-base font-semibold text-white"
                style={{ backgroundColor: VIPPS, color: "#1A1512" }}
              >
                Gi med Vipps
              </button>
            </form>
          ) : vippsLink ? (
            <a
              href={vippsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg px-6 text-base font-semibold"
              style={{ backgroundColor: VIPPS, color: "#1A1512" }}
            >
              Gi med Vipps
            </a>
          ) : (
            <p className="text-base text-ink">
              Vipps <span className="font-semibold">#595791</span>
            </p>
          )}
          <p className="mt-3 text-base text-ink-soft">
            Eller overfør til konto <span className="font-semibold text-ink">3207 31 01688</span>
          </p>
        </div>
      </div>
    </section>
  );
}
