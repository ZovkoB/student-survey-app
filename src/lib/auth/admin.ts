import { Role } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const SEED_ADMIN_EMAIL = "admin@fsre.sum.ba";

export async function requireAdminUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "You must be signed in to perform this action." as const };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Only administrators can manage surveys." as const };
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!admin || admin.role !== Role.ADMIN) {
    return { error: "Admin account not found." as const };
  }

  return { admin, session } as const;
}

export function getAdminSurveyWhere(adminId: string, adminEmail: string) {
  return {
    OR: [
      { createdById: adminId },
      {
        createdBy: {
          email: adminEmail.toLowerCase(),
        },
      },
    ],
  };
}
