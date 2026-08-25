"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be signed in to perform this action." as const };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Only administrators can manage surveys." as const };
  }

  return { session } as const;
}

async function getOwnedSurvey(surveyId: string, adminId: string) {
  return prisma.survey.findFirst({
    where: {
      id: surveyId,
      createdById: adminId,
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
    where: { createdById: authResult.session.user.id },
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
    message: "Surveys loaded successfully.",
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
      message: parsed.error.issues[0]?.message ?? "Invalid survey data.",
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
          targetProgram: targetProgram || null,
          targetYear: targetYear ?? null,
          createdById: authResult.session.user.id,
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
      message: "Survey created successfully.",
      data: {
        id: survey.id,
        title: survey.title,
      },
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        message: "Failed to create survey due to a database error.",
      };
    }

    return {
      success: false,
      message: "Something went wrong while creating the survey.",
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
    authResult.session.user.id,
  );

  if (!survey) {
    return { success: false, message: "Survey not found." };
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
        ? "Survey activated successfully."
        : "Survey deactivated successfully.",
      data: { isActive: updatedSurvey.isActive },
    };
  } catch {
    return {
      success: false,
      message: "Failed to update survey status.",
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
    authResult.session.user.id,
  );

  if (!survey) {
    return { success: false, message: "Survey not found." };
  }

  try {
    await prisma.survey.delete({
      where: { id: survey.id },
    });

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Survey deleted successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete survey.",
    };
  }
}
