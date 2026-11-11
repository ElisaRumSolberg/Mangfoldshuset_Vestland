"use client";

import { feeForPerson } from "@/lib/membership-fee";
import { feeStartsText, isFreePeriod } from "@/lib/membership-year";

/** Viser kontingenten for én person ut fra fødselsdatoen som er skrevet inn. */
export default function FeeBadge({ birth }: { birth: string }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) return null;
  const today = new Date().toISOString().slice(0, 10);
  const fee = feeForPerson(birth, today);
  return (
    <span
      className="inline-flex w-fit items-center rounded-full bg-[#EAF0E9] px-3 py-1 text-xs font-semibold text-green-dark"
      aria-live="polite"
    >
      {isFreePeriod(today) ? `Gratis ut 2026. Fra ${feeStartsText()}: ${fee} kr per år` : `Kontingent: ${fee} kr per år`}
    </span>
  );
}
