"use client";

import { useState, type InputHTMLAttributes } from "react";

/** Passordfelt med «Vis»-knapp, så man kan se at man har skrevet riktig. */
export default function PasswordInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">
) {
  const [shown, setShown] = useState(false);
  const { className = "", ...rest } = props;

  return (
    <div className="relative">
      <input
        {...rest}
        type={shown ? "text" : "password"}
        className={`${className} pr-20`}
      />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 min-w-16 rounded-r-lg px-3 text-sm font-semibold text-green-dark hover:underline"
      >
        {shown ? "Skjul" : "Vis"}
        <span className="sr-only"> passordet</span>
      </button>
    </div>
  );
}
