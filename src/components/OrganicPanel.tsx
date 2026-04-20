type OrganicPanelProps = {
  className?: string;
  variant?: "green" | "fig";
  /** Overstyrer variant med en egen fargeprofil (hex-hex), f.eks. et utvalgs merkefarger. */
  colors?: { from: string; to: string };
};

/**
 * Designet abstrakt panel i merkefargene – brukes der et ekte bilde ennå
 * ikke finnes, uten å ty til generiske stockbilder. Bytt ut med next/image
 * (ekte foto) + className="warm-photo" fra globals.css når bildet er klart.
 */
export default function OrganicPanel({
  className = "",
  variant = "green",
  colors,
}: OrganicPanelProps) {
  const base =
    variant === "green"
      ? "from-[#5B7A57] to-[#3F5A3E]"
      : "from-[#B9614F] to-[#8B3A3C]";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 ${colors ? "" : `bg-gradient-to-br ${base}`} ${className}`}
      style={colors ? { backgroundImage: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})` } : undefined}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-90"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="330" cy="60" r="140" fill="white" opacity="0.06" />
        <circle cx="40" cy="340" r="110" fill="white" opacity="0.05" />
        <path
          d="M200 90C200 90 130 150 130 220C130 265 162 300 200 300C238 300 270 265 270 220C270 150 200 90 200 90Z"
          fill="white"
          opacity="0.09"
        />
        <path
          d="M204 96C220 78 250 62 285 70C292 86 292 116 268 134C246 120 220 104 204 96Z"
          fill="white"
          opacity="0.12"
        />
        <path
          d="M60 60C60 60 30 90 30 122C30 142 44 158 60 158C76 158 90 142 90 122C90 90 60 60 60 60Z"
          fill="white"
          opacity="0.07"
        />
      </svg>
    </div>
  );
}
