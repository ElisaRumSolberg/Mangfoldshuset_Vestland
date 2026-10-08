"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NyttPassordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nettleserklienten bytter koden fra e-postlenken mot en gjenopprettingsøkt.
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError("Passordet må være minst 12 tegn.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Kunne ikke lagre passordet. Be om en ny lenke og prøv igjen.");
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/admin/logg-inn?passord=endret");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-2 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-cream p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-medium text-ink">Nytt passord</h1>
        <p className="mt-1 text-sm text-ink-soft">Mangfoldshuset Vestland</p>

        {ready ? (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                Nytt passord (minst 12 tegn)
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-fig"
              />
            </div>
            {error && <p className="text-sm text-fig">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-fig px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fig-dark disabled:opacity-60"
            >
              {loading ? "Lagrer…" : "Lagre passord"}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">
            Åpne lenken fra e-posten for å velge nytt passord. Har lenken utløpt,
            kan du be om en ny på{" "}
            <a href="/admin/logg-inn" className="underline hover:text-ink">
              innloggingssiden
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
