"use client";

import { useState } from "react";

const AMOUNTS = [100, 250, 500];

const chip =
  "flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-base font-semibold text-ink transition-colors peer-checked:border-green peer-checked:bg-green peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green hover:border-green";

/**
 * Valg av beløp. Skriver man i «Annet beløp», velges det valget av seg selv (ellers sendes det forhåndsvalgte
 * beløpet i stedet for det man skrev), og velger man et fast beløp igjen, tømmes det egne beløpet.
 */
export default function DonationAmount() {
  const [selected, setSelected] = useState<string>("250");
  const [custom, setCustom] = useState("");

  return (
    <fieldset>
      <legend className="sr-only">Velg beløp</legend>
      <div className="grid grid-cols-3 gap-2">
        {AMOUNTS.map((a) => (
          <label key={a} className="cursor-pointer">
            <input
              type="radio"
              name="amount"
              value={a}
              checked={selected === String(a)}
              onChange={() => {
                setSelected(String(a));
                setCustom("");
              }}
              className="peer sr-only"
            />
            <span className={chip}>{a} kr</span>
          </label>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="shrink-0 cursor-pointer">
          <input
            type="radio"
            name="amount"
            value="annet"
            checked={selected === "annet"}
            onChange={() => setSelected("annet")}
            className="peer sr-only"
          />
          <span className={chip}>Annet beløp</span>
        </label>
        <input
          name="custom"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="kr"
          aria-label="Annet beløp i kroner"
          value={custom}
          onFocus={() => setSelected("annet")}
          onChange={(e) => {
            setCustom(e.target.value.replace(/[^0-9]/g, ""));
            setSelected("annet");
          }}
          className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-white px-4 text-base text-ink outline-none focus:border-green"
        />
      </div>
    </fieldset>
  );
}
