"use client";

import { useState } from "react";
import FeeBadge from "@/components/FeeBadge";

const GENDERS = [
  ["", "Velg kjønn"],
  ["kvinne", "Kvinne"],
  ["mann", "Mann"],
  ["annet", "Annet"],
  ["ukjent", "Ønsker ikke å oppgi"],
] as const;

/**
 * Rader for familiemedlemmer (2–6). Fødselsdato og kjønn er påkrevd så snart et navn er skrevet.
 * Radene har faste feltnavn (fam_name_n / fam_birth_n / fam_gender_n) som serveren leser.
 * Hver person blir sitt eget medlem og betaler for seg.
 */
export default function FamilyRows({ inputClass }: { inputClass: string }) {
  const [names, setNames] = useState<Record<number, string>>({});
  const [births, setBirths] = useState<Record<number, string>>({});

  return (
    <div className="mt-4 flex flex-col gap-4">
      {[2, 3, 4, 5, 6].map((n) => {
        const filled = (names[n] ?? "").trim() !== "";
        return (
          <fieldset key={n} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <legend className="sr-only">Person {n}</legend>
            <input
              name={`fam_name_${n}`}
              aria-label={`Person ${n}: navn`}
              placeholder={`Person ${n}: fornavn og etternavn`}
              value={names[n] ?? ""}
              onChange={(e) => setNames((p) => ({ ...p, [n]: e.target.value }))}
              className={inputClass}
            />
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name={`fam_birth_${n}`}
                aria-label={`Person ${n}: fødselsdato`}
                required={filled}
                value={births[n] ?? ""}
                onChange={(e) => setBirths((p) => ({ ...p, [n]: e.target.value }))}
                className={inputClass}
              />
              {filled && <FeeBadge birth={births[n] ?? ""} />}
            </div>
            <select name={`fam_gender_${n}`} aria-label={`Person ${n}: kjønn`} required={filled} defaultValue="" className={inputClass}>
              {GENDERS.map(([v, text]) => (
                <option key={v} value={v}>
                  {text}
                </option>
              ))}
            </select>
          </fieldset>
        );
      })}
      <p className="text-xs text-ink-soft">
        Fødselsdato og kjønn må fylles ut for hver person du legger til. Du kan velge «Ønsker ikke å oppgi». Hver
        person blir eget medlem og betaler for seg.
      </p>
    </div>
  );
}
