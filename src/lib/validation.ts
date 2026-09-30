import { z } from "zod";

const name = z.string().trim().min(1, "Navn mangler").max(100);
const email = z.string().trim().min(1, "E-post mangler").max(200).email("Ugyldig e-post").toLowerCase();
const phone = z.string().trim().regex(/^[+\d().\s-]{5,30}$/, "Ugyldig telefonnummer").optional().or(z.literal(""));
const birthDate = z.iso.date().refine(value => value <= new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()), "Fødselsdato kan ikke være i fremtiden").optional().or(z.literal(""));
export const familyMembersSchema = z.array(z.object({ name: z.string().trim().min(1).max(200), birth_date: birthDate })).max(5);
const shortText = (max: number) => z.string().trim().min(1).max(max);
const longText = (max: number) => z.string().trim().min(1).max(max);

export const contactSchema = z.object({
  name,
  email,
  subject: shortText(200),
  message: longText(5000),
});

export const membershipSchema = z.object({
  first_name: shortText(100),
  last_name: shortText(100),
  email,
  membership_type: z.enum(["enkelt", "familie"]),
  birth_date: birthDate,
  address: z.string().trim().max(300).optional().or(z.literal("")),
  phone,
  guardian: z.string().trim().max(200).optional().or(z.literal("")),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (!value.birth_date) return;
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const eighteenth = `${Number(value.birth_date.slice(0, 4)) + 18}${value.birth_date.slice(4)}`;
  if (today < eighteenth && !value.guardian?.trim()) {
    ctx.addIssue({ code: "custom", path: ["guardian"], message: "Oppgi foresatt når du er under 18 år" });
  }
});

export const applicationSchema = z.object({
  type: z.enum(["frivillig", "ide", "samarbeid"]),
  name,
  email,
  phone,
});

export const activitySignupSchema = z.object({
  name,
  email,
  phone,
  participants: z.coerce.number().int().min(1).max(50),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});
