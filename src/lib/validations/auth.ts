import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const baseRegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.enum(["ADMIN", "STUDENT"], {
    required_error: "Please select a role",
    invalid_type_error: "Please select a role",
  }),
  studyProgram: z.string().trim().optional(),
  yearOfStudy: z.coerce.number().int().optional(),
});

export const registerSchema = baseRegisterSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === "STUDENT") {
      if (!data.studyProgram || data.studyProgram.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Study program is required for students",
          path: ["studyProgram"],
        });
      }

      if (
        data.yearOfStudy === undefined ||
        Number.isNaN(data.yearOfStudy) ||
        data.yearOfStudy < 1 ||
        data.yearOfStudy > 6
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid year of study (1–6)",
          path: ["yearOfStudy"],
        });
      }
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
