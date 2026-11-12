type OrganicPanelProps = {
  className?: string;
  variant?: "green" | "fig";
  /** Overstyrer variant med en egen fargeprofil (hex-hex), f.eks. et utvalgs merkefarger. */
  colors?: { from: string; to: string };
};

/**
 * Enkel plassholder i merkefargene der et ekte bilde ennå ikke finnes.
 * Bytt ut med next/image (ekte foto) + className="warm-photo" når bildet er klart.
 */
export default function OrganicPanel({
  className = "",
  variant = "green",
  colors,
}: OrganicPanelProps) {
  const base = variant === "green" ? "bg-green" : "bg-fig";

  return (
    <div
      className={`overflow-hidden rounded-xl ${colors ? "" : base} ${className}`}
      style={colors ? { backgroundColor: colors.from } : undefined}
    />
  );
}
