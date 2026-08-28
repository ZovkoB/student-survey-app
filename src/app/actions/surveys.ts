"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getAdminSurveyWhere, requireAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { normalizeStudyProgram } from "@/lib/study-program";
import {
  createSurveySchema,
  type CreateSurveyInput,
} from "@/lib/validations/survey";

export type SurveyActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

export type AdminSurveyListItem = {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  targetYear: number | null;
  targetProgram: string | null;
  isActive: boolean;
  createdAt: string;
  questionCount: number;
  responseCount: number;
};

async function requireAdminSession() {
  return requireAdminUser();
}

async function getOwnedSurvey(surveyId: string, adminId: string, adminEmail: string) {
  return prisma.survey.findFirst({
    where: {
      id: surveyId,
      ...getAdminSurveyWhere(adminId, adminEmail),
    },
  });
}

export async function getAdminSurveys(): Promise<
  SurveyActionResult<AdminSurveyListItem[]>
> {
  const authResult = await requireAdminSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const surveys = await prisma.survey.findMany({
    where: getAdminSurveyWhere(
      authResult.admin.id,
      authResult.admin.email,
    ),
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          questions: true,
          responses: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Ankete su uspješno učitane.",
    data: surveys.map((survey) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      subject: survey.subject,
      targetYear: survey.targetYear,
      targetProgram: survey.targetProgram,
      isActive: survey.isActive,
      createdAt: survey.createdAt.toISOString(),
      questionCount: survey._count.questions,
      responseCount: survey._count.responses,
    })),
  };
}

export async function createSurvey(
  input: CreateSurveyInput,
): Promise<SurveyActionResult<{ id: string; title: string }>> {
  const authResult = await requireAdminSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const parsed = createSurveySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Podaci ankete nisu valjani.",
    };
  }

  const { title, description, subject, targetProgram, targetYear, questions } =
    parsed.data;

  try {
    const survey = await prisma.$transaction(async (tx) =>
      tx.survey.create({
        data: {
          title,
          description,
          subject: subject || null,
          targetProgram: normalizeStudyProgram(targetProgram),
          targetYear: targetYear ?? null,
          createdById: authResult.admin.id,
          questions: {
            create: questions.map((question) => ({
              text: question.text,
              type: question.type,
              isRequired: question.isRequired,
              order: question.order,
              options:
                question.type === "SINGLE_CHOICE" ||
                question.type === "MULTIPLE_CHOICE"
                  ? {
                      create: (question.options ?? []).map((option) => ({
                        text: option.text,
                        order: option.order,
                      })),
                    }
                  : undefined,
            })),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      }),
    );

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Anketa je uspješno kreirana.",
      data: {
        id: survey.id,
        title: survey.title,
      },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Kreiranje ankete nije uspjelo zbog greške baze podataka.",
      };
    }

    return {
      success: false,
      message: "Došlo je do greške pri kreiranju ankete.",
    };
  }
}

export async function toggleSurveyStatus(
  surveyId: string,
): Promise<SurveyActionResult<{ isActive: boolean }>> {
  const authResult = await requireAdminSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const survey = await getOwnedSurvey(
    surveyId,
    authResult.admin.id,
    authResult.admin.email,
  );

  if (!survey) {
    return { success: false, message: "Anketa nije pronađena." };
  }

  try {
    const updatedSurvey = await prisma.survey.update({
      where: { id: survey.id },
      data: { isActive: !survey.isActive },
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: updatedSurvey.isActive
        ? "Anketa je uspješno aktivirana."
        : "Anketa je uspješno deaktivirana.",
      data: { isActive: updatedSurvey.isActive },
    };
  } catch {
    return {
      success: false,
      message: "Ažuriranje statusa ankete nije uspjelo.",
    };
  }
}

export async function deleteSurvey(
  surveyId: string,
): Promise<SurveyActionResult> {
  const authResult = await requireAdminSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const survey = await getOwnedSurvey(
    surveyId,
    authResult.admin.id,
    authResult.admin.email,
  );

  if (!survey) {
    return { success: false, message: "Anketa nije pronađena." };
  }

  try {
    await prisma.survey.delete({
      where: { id: survey.id },
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Anketa je uspješno obrisana.",
    };
  } catch {
    return {
      success: false,
      message: "Brisanje ankete nije uspjelo.",
    };
  }
}
