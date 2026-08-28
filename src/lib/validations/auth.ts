import { z } from "zod";

const FSRE_EMAIL_SUFFIX = "@fsre.sum.ba";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-pošta je obavezna")
    .email("Unesite valjanu e-mail adresu"),
  password: z.string().min(1, "Lozinka je obavezna"),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "E-pošta je obavezna")
      .email("Unesite valjanu e-mail adresu")
      .refine(
        (value) => value.toLowerCase().endsWith(FSRE_EMAIL_SUFFIX),
        "Registracija je moguća samo s fakultetskom e-poštom (@fsre.sum.ba)",
      ),
    password: z
      .string()
      .min(8, "Lozinka mora imati najmanje 8 znakova"),
    confirmPassword: z.string().min(1, "Potvrdite lozinku"),
    studyProgram: z
      .string()
      .trim()
      .min(1, "Studijski smjer je obavezan"),
    yearOfStudy: z.coerce
      .number()
      .int()
      .min(1, "Unesite valjanu godinu studija (1–6)")
      .max(6, "Unesite valjanu godinu studija (1–6)"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Lozinke se ne podudaraju",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const FSRE_EMAIL_DOMAIN_MESSAGE =
  "Registracija je moguća samo s fakultetskom e-poštom (@fsre.sum.ba)";

export function isFsreEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(FSRE_EMAIL_SUFFIX);
}
