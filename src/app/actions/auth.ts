"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { normalizeStudyProgram } from "@/lib/study-program";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export type AuthActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof RegisterInput, string[]>>;
};

function formatZodErrors(
  error: { issues: { path: PropertyKey[]; message: string }[] },
): Partial<Record<keyof RegisterInput, string[]>> {
  const fieldErrors: Partial<Record<keyof RegisterInput, string[]>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string") {
      const key = field as keyof RegisterInput;
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
  }

  return fieldErrors;
}

export async function registerUser(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawInput = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    studyProgram: formData.get("studyProgram") || undefined,
    yearOfStudy: formData.get("yearOfStudy") || undefined,
  };

  const parsed = registerSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      message: "Ispravite greške u obrascu i pokušajte ponovno.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { email, password, studyProgram, yearOfStudy } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Račun s ovom e-poštom već postoji.",
      fieldErrors: {
        email: ["Račun s ovom e-poštom već postoji."],
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "STUDENT",
        studyProgram: normalizeStudyProgram(studyProgram),
        yearOfStudy,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Račun s ovom e-poštom već postoji.",
        fieldErrors: {
          email: ["Račun s ovom e-poštom već postoji."],
        },
      };
    }

    return {
      success: false,
      message: "Došlo je do greške pri kreiranju računa. Pokušajte ponovno.",
    };
  }

  return {
    success: true,
    message: "Račun je uspješno kreiran. Sada se možete prijaviti.",
  };
}
