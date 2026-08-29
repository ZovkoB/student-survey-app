"use server";

import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth/admin";
import {
  createAdminSchema,
  type CreateAdminField,
  type CreateAdminInput,
} from "@/lib/validations/admin-user";

export type CreateAdminActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: Partial<Record<CreateAdminField, string[]>>;
};

function formatZodErrors(
  error: { issues: { path: PropertyKey[]; message: string }[] },
): Partial<Record<CreateAdminField, string[]>> {
  const fieldErrors: Partial<Record<CreateAdminField, string[]>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string") {
      const key = field as CreateAdminField;
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
  }

  return fieldErrors;
}

export async function createAdminUser(
  input: CreateAdminInput,
): Promise<CreateAdminActionResult> {
  const authResult = await requireAdminUser();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const parsed = createAdminSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Ispravite greške u obrascu i pokušajte ponovno.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const { fullName, email, password } = parsed.data;
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
        role: Role.ADMIN,
        name: fullName,
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
      message: "Došlo je do greške pri kreiranju administratora. Pokušajte ponovno.",
    };
  }

  return {
    success: true,
    message: "Novi administrator je uspješno kreiran!",
  };
}
