import { z } from "zod";

import { isFsreEmail } from "@/lib/validations/auth";

export const createAdminSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ime i prezime mora imati najmanje 2 znaka"),
  email: z
    .string()
    .trim()
    .min(1, "E-pošta je obavezna")
    .email("Unesite valjanu e-mail adresu")
    .refine(
      (value) => isFsreEmail(value),
      "Administrator mora imati fakultetsku e-poštu (@fsre.sum.ba)",
    ),
  password: z
    .string()
    .min(8, "Privremena lozinka mora imati najmanje 8 znakova"),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export type CreateAdminField = keyof CreateAdminInput;
