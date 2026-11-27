// Kontrollen må skje før noe skrives til databasen: ugyldig skjema gir feilmelding og ingen lagring.

import { describe, expect, it, vi } from "vitest";

// Klienten er et tomt objekt: ethvert databasekall etter en ugyldig innsending ville feilet testen.
const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from }) }));
vi.mock("@/lib/auth-guard", () => ({ requireOwner: vi.fn(), requireEditor: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

import { addActivity, updateActivity } from "@/app/admin/(dashboard)/aktiviteter/actions";
import { addMember, updateMember } from "@/app/admin/(dashboard)/medlemmer/actions";
import { updateStats } from "@/app/admin/(dashboard)/statistikk/actions";
import { addProgram, updateProgram } from "@/app/admin/(dashboard)/tilbud/actions";

const empty = () => new FormData();
const negative = () => {
  const data = new FormData();
  data.set("participants", "-1");
  return data;
};

describe("admin actions reject invalid forms before touching the database", () => {
  it.each([
    ["addActivity", () => addActivity(empty()), "/admin/aktiviteter?feil=mangler-felt"],
    ["updateActivity", () => updateActivity("a1", empty()), "/admin/aktiviteter/a1?feil=mangler-felt"],
    ["addProgram", () => addProgram(empty()), "/admin/tilbud?feil=mangler-felt"],
    ["updateProgram", () => updateProgram("p1", empty()), "/admin/tilbud/p1?feil=mangler-felt"],
    ["addMember", () => addMember(empty()), "/admin/medlemmer?feil=mangler-felt"],
    ["updateMember", () => updateMember("m1", empty()), "/admin/medlemmer/m1?feil=mangler-felt"],
    ["updateStats", () => updateStats(negative()), "/admin/statistikk?feil=ugyldig-tall"],
  ])("%s", async (_name, run, url) => {
    from.mockClear();
    await expect(run()).rejects.toThrow(`REDIRECT ${url}`);
    expect(from).not.toHaveBeenCalled();
  });
});
