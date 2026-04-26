"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIDE = 2000; // lengste side i piksler
const MAX_MB = 50; // Supabase (gratisplan) maks per fil

/** Forminsker store mobilbilder før opplasting (sparer lagringsplass og gjør siden raskere). */
async function shrink(file: File): Promise<File | Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) {
      bmp.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

// Flere bilder lastes opp rett fra nettleseren til Supabase. Skjemaet sender bare adressene
// (ett skjult felt «photos» per bilde), så Vercel sin størrelsesgrense rammer ikke.
export default function PhotosField({
  initial,
  folder,
  name = "photos",
}: {
  initial: string[];
  folder: string;
  /** Navnet på skjemafeltet (og feltet_present). Standard "photos" for bildegalleri. */
  name?: string;
}) {
  const [photos, setPhotos] = useState(initial);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    setError("");
    input.setCustomValidity("Vent til opplastingen er ferdig.");
    const supabase = createClient();
    const added: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatus(`Laster opp bilde ${i + 1} av ${files.length} …`);
      if (file.size > MAX_MB * 1024 * 1024) {
        failed.push(`${file.name}: over ${MAX_MB} MB`);
        continue;
      }
      const out = await shrink(file);
      const resized = out !== file;
      const ext = resized ? "jpg" : file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("images").upload(path, out, {
        contentType: resized ? "image/jpeg" : file.type || undefined,
        cacheControl: "31536000",
      });
      if (upErr) {
        failed.push(`${file.name}: ${upErr.message}`);
        continue;
      }
      added.push(supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
    }

    setPhotos((p) => [...p, ...added]);
    input.value = "";
    input.setCustomValidity("");
    setStatus(added.length ? `✓ ${added.length} bilde(r) lastet opp – husk å lagre endringene.` : "");
    if (failed.length) setError(`Kunne ikke laste opp: ${failed.join("; ")}`);
  }

  return (
    <div>
      <input type="hidden" name={`${name}_present`} value="1" />
      {photos.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {photos.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((url) => (
            <li key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-fig shadow"
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-fig"
      />
      {status && (
        <p role="status" className="mt-1.5 text-xs text-ink-soft">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-fig">
          {error}
        </p>
      )}
    </div>
  );
}
