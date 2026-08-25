"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
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
    role: formData.get("role"),
    studyProgram: formData.get("studyProgram") || undefined,
    yearOfStudy: formData.get("yearOfStudy") || undefined,
  };

  const parsed = registerSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below and try again.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { email, password, role, studyProgram, yearOfStudy } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
      fieldErrors: {
        email: ["An account with this email already exists."],
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        studyProgram: role === "STUDENT" ? studyProgram : null,
        yearOfStudy: role === "STUDENT" ? yearOfStudy : null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "An account with this email already exists.",
        fieldErrors: {
          email: ["An account with this email already exists."],
        },
      };
    }

    return {
      success: false,
      message: "Something went wrong while creating your account. Please try again.",
    };
  }

  return {
    success: true,
    message: "Account created successfully. You can now sign in.",
  };
}
