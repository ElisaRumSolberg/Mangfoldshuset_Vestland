"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Supabase (gratisplan) tillater maks 50 MB per fil.
const MAX_MB = 50;

type Props = {
  /** Navnet på det skjulte feltet som sender filens adresse til serveren. */
  name: string;
  /** Mappe i bucketen "images". */
  folder: string;
  accept: string;
  required?: boolean;
};

// Filen lastes opp rett fra nettleseren til Supabase, ikke via Vercel-serveren
// (Vercel avviser forespørsler over ca. 4,5 MB). Skjemaet sender bare adressen.
export default function FileUpload({ name, folder, accept, required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  // Etter innsending nullstiller React skjemaet; nullstill da også adressen vi husker.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    function onReset() {
      setUrl("");
      setState("idle");
      setMessage("");
    }
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];

    // Så lenge opplastingen pågår eller har feilet, hindrer nettleseren innsending.
    const block = (msg: string) => input.setCustomValidity(msg);
    setUrl("");
    block("");

    if (!file) {
      setState("idle");
      setMessage("");
      return;
    }

    const mb = file.size / 1024 / 1024;
    if (mb > MAX_MB) {
      const msg = `Filen er ${mb.toFixed(0)} MB. Maks er ${MAX_MB} MB.`;
      block(msg);
      setState("error");
      setMessage(msg);
      return;
    }

    setState("uploading");
    setMessage(`Laster opp ${file.name} (${mb.toFixed(1)} MB) …`);
    block("Vent til opplastingen er ferdig.");

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("images").upload(path, file, {
      contentType: file.type || undefined,
      cacheControl: "31536000",
    });

    if (error) {
      const msg = `Opplastingen feilet: ${error.message}. Velg filen på nytt.`;
      block(msg);
      setState("error");
      setMessage(msg);
      return;
    }

    setUrl(supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
    block("");
    setState("done");
    setMessage(`✓ ${file.name} er lastet opp`);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        required={required}
        onChange={onChange}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
      />
      <input type="hidden" name={name} value={url} />
      {message && (
        <p
          role="status"
          className={`mt-1.5 text-xs ${
            state === "error"
              ? "text-fig"
              : state === "done"
                ? "text-green-dark"
                : "text-ink-soft"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
