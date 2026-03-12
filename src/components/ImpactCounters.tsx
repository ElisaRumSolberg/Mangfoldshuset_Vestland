const counters = [
  { value: "48", label: "Aktiviteter i år", color: "text-fig" },
  { value: "1 350+", label: "Deltakere", color: "text-green-dark" },
  { value: "1 820", label: "Frivillige timer", color: "text-fig" },
];

export default function ImpactCounters() {
  return (
    <div className="border-b border-line bg-cream-2">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-6 py-12 text-center">
        {counters.map((c, i) => (
          <div
            key={c.label}
            className={
              i === 1 ? "border-x border-line" : undefined
            }
          >
            <div className={`font-serif text-4xl font-semibold md:text-[44px] ${c.color}`}>
              {c.value}
            </div>
            <div className="mt-1 text-sm font-semibold text-ink-soft">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
