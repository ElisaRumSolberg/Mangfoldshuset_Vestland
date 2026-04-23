"use client";

import { useState } from "react";
import { CATEGORY_OPTIONS } from "@/lib/categories";

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
    active
      ? "border-fig bg-fig/10 text-fig"
      : "border-line text-ink-soft hover:border-fig/50"
  }`;

// Kryssbare kategorier + mulighet til å legge til en ny. Sender valgene som
// flere skjulte "categories"-felt, slik at serverhandlingen leser dem med
// formData.getAll("categories").
export default function CategoryPicker({ initial = [] }: { initial?: string[] }) {
  const extra = initial.filter(
    (c) => !(CATEGORY_OPTIONS as readonly string[]).includes(c)
  );
  const [selected, setSelected] = useState<string[]>(initial);
  const [ownTags, setOwnTags] = useState<string[]>(extra);
  const [input, setInput] = useState("");

  function toggle(tag: string) {
    setSelected((s) => (s.includes(tag) ? s.filter((t) => t !== tag) : [...s, tag]));
  }

  function addOwn() {
    const tag = input.trim();
    if (!tag) return;
    setOwnTags((t) => (t.includes(tag) ? t : [...t, tag]));
    setSelected((s) => (s.includes(tag) ? s : [...s, tag]));
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[...CATEGORY_OPTIONS, ...ownTags].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={chip(selected.includes(tag))}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOwn();
            }
          }}
          placeholder="Ny kategori …"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
        />
        <button
          type="button"
          onClick={addOwn}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-fig hover:text-fig"
        >
          Legg til
        </button>
      </div>

      {selected.length === 0 && (
        <p className="mt-1.5 text-xs text-fig">Velg minst én kategori.</p>
      )}

      {selected.map((tag) => (
        <input key={tag} type="hidden" name="categories" value={tag} />
      ))}
    </div>
  );
}
