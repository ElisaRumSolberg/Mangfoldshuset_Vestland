"use client";

import { useState } from "react";
import FeeBadge from "@/components/FeeBadge";

/** Fødselsdato-felt som viser hva kontingenten blir for denne personen. */
export default function BirthDateInput({ id, name, className }: { id: string; name: string; className: string }) {
  const [birth, setBirth] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <input id={id} type="date" name={name} required value={birth} onChange={(e) => setBirth(e.target.value)} className={className} />
      <FeeBadge birth={birth} />
    </div>
  );
}
