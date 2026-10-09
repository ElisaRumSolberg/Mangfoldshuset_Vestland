"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({
  target,
  suffix = "",
  duration = 1000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const start = performance.now();

          function tick(now: number) {
            const progress = Math.min(Math.max((now - start) / duration, 0), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) frame = requestAnimationFrame(tick);
          }
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target, duration]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">
        {value.toLocaleString("nb-NO")}
        {suffix}
      </span>
      <span className="sr-only">
        {target.toLocaleString("nb-NO")}
        {suffix}
      </span>
    </span>
  );
}
