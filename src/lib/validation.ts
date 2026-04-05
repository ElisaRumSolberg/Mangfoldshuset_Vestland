import { z } from "zod";

const name = z.string().trim().min(1, "Navn mangler").max(100);
const email = z.string().trim().min(1, "E-post mangler").max(200).email("Ugyldig e-post");
const phone = z.string().trim().max(30).optional().or(z.literal(""));
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
  birth_date: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  phone,
  guardian: z.string().trim().max(200).optional().or(z.literal("")),
  comment: z.string().trim().max(2000).optional().or(z.literal("")),
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
