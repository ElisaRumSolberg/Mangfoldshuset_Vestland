import Image from "next/image";

/** Animert logo-fremvisning: logoen med en varm pulserende glød. */
export default function WarmHouseAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-[20px] bg-cream ${className}`}>
      <style>{`
        .wh-glow { animation: wh-glow 3.5s ease-in-out infinite; }
        @keyframes wh-glow { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
        .wh-logo { animation: wh-logo-pulse 3.5s ease-in-out infinite; }
        @keyframes wh-logo-pulse {
          0%, 100% { filter: drop-shadow(0 0 14px rgba(244,199,122,0.55)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 26px rgba(244,199,122,0.85)); transform: scale(1.03); }
        }
      `}</style>

      <svg viewBox="0 0 480 340" className="absolute h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="wh-warmGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#F4C77A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F4C77A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="wh-glow" cx="240" cy="170" r="150" fill="url(#wh-warmGlow)" />
      </svg>

      <div className="wh-logo relative">
        <Image src="/logo.png" alt="Mangfoldshuset Vestland" width={413} height={190} className="h-28 w-auto sm:h-36" priority />
      </div>
    </div>
  );
}
