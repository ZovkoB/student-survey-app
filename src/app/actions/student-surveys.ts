"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getStudyProgramMatchValues,
  normalizeStudyProgram,
} from "@/lib/study-program";
import {
  submitSurveyResponseSchema,
  validateSubmissionAgainstSurvey,
  type SubmitSurveyResponseInput,
} from "@/lib/validations/student-survey";

export type StudentSurveyActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

export type AvailableSurveyListItem = {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  targetYear: number | null;
  targetProgram: string | null;
  questionCount: number;
  createdAt: string;
};

export type CompletedSurveyListItem = AvailableSurveyListItem & {
  submittedAt: string;
};

export type SurveyForFill = {
  id: string;
  title: string;
  description: string;
  subject: string | null;
  targetYear: number | null;
  targetProgram: string | null;
  questions: {
    id: string;
    text: string;
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT" | "RATING_1_5";
    isRequired: boolean;
    order: number;
    options: {
      id: string;
      text: string;
      order: number;
    }[];
  }[];
};

async function requireStudentSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Morate biti prijavljeni za pristup anketama." as const };
  }

  if (session.user.role !== "STUDENT") {
    return { error: "Samo studenti mogu sudjelovati u anketama." as const };
  }

  return { session } as const;
}

async function getStudentProfile(studentId: string) {
  return prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      studyProgram: true,
      yearOfStudy: true,
    },
  });
}

function buildSurveyTargetingFilter(
  studyProgram: string | null | undefined,
  yearOfStudy: number | null | undefined,
): Prisma.SurveyWhereInput {
  const normalizedProgram = normalizeStudyProgram(studyProgram);
  const programMatchValues = getStudyProgramMatchValues(studyProgram);

  const programFilter: Prisma.SurveyWhereInput = normalizedProgram
    ? {
        OR: [
          { targetProgram: null },
          { targetProgram: { in: programMatchValues } },
        ],
      }
    : { targetProgram: null };

  const yearFilter: Prisma.SurveyWhereInput =
    yearOfStudy !== null && yearOfStudy !== undefined
      ? {
          OR: [{ targetYear: null }, { targetYear: yearOfStudy }],
        }
      : { targetYear: null };

  return {
    isActive: true,
    AND: [programFilter, yearFilter],
  };
}

function mapSurveyListItem(
  survey: {
    id: string;
    title: string;
    description: string;
    subject: string | null;
    targetYear: number | null;
    targetProgram: string | null;
    createdAt: Date;
    _count: { questions: number };
  },
  submittedAt?: Date,
): AvailableSurveyListItem | CompletedSurveyListItem {
  const base = {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    subject: survey.subject,
    targetYear: survey.targetYear,
    targetProgram: survey.targetProgram,
    questionCount: survey._count.questions,
    createdAt: survey.createdAt.toISOString(),
  };

  if (submittedAt) {
    return {
      ...base,
      submittedAt: submittedAt.toISOString(),
    };
  }

  return base;
}

export async function getAvailableSurveys(): Promise<
  StudentSurveyActionResult<AvailableSurveyListItem[]>
> {
  const authResult = await requireStudentSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const student = await getStudentProfile(authResult.session.user.id);

  if (!student) {
    return { success: false, message: "Studentski profil nije pronađen." };
  }

  const surveys = await prisma.survey.findMany({
    where: {
      ...buildSurveyTargetingFilter(student.studyProgram, student.yearOfStudy),
      responses: {
        none: {
          studentId: student.id,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  return {
    success: true,
    message: "Dostupne ankete su uspješno učitane.",
    data: surveys.map((survey) => mapSurveyListItem(survey)),
  };
}

export async function getCompletedSurveys(): Promise<
  StudentSurveyActionResult<CompletedSurveyListItem[]>
> {
  const authResult = await requireStudentSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const responses = await prisma.response.findMany({
    where: { studentId: authResult.session.user.id },
    orderBy: { submittedAt: "desc" },
    include: {
      survey: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
      },
    },
  });

  return {
    success: true,
    message: "Ispunjene ankete su uspješno učitane.",
    data: responses.map((response) =>
      mapSurveyListItem(response.survey, response.submittedAt),
    ) as CompletedSurveyListItem[],
  };
}

export async function getSurveyById(
  surveyId: string,
): Promise<StudentSurveyActionResult<SurveyForFill>> {
  const authResult = await requireStudentSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const student = await getStudentProfile(authResult.session.user.id);

  if (!student) {
    return { success: false, message: "Studentski profil nije pronađen." };
  }

  const existingResponse = await prisma.response.findUnique({
    where: {
      surveyId_studentId: {
        surveyId,
        studentId: student.id,
      },
    },
  });

  if (existingResponse) {
    return {
      success: false,
      message: "Već ste ispunili ovu anketu.",
    };
  }

  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      ...buildSurveyTargetingFilter(student.studyProgram, student.yearOfStudy),
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!survey) {
    return {
      success: false,
      message: "Anketa nije pronađena ili nije dostupna za vaš profil.",
    };
  }

  return {
    success: true,
    message: "Anketa je uspješno učitana.",
    data: {
      id: survey.id,
      title: survey.title,
      description: survey.description,
      subject: survey.subject,
      targetYear: survey.targetYear,
      targetProgram: survey.targetProgram,
      questions: survey.questions.map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type,
        isRequired: question.isRequired,
        order: question.order,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          order: option.order,
        })),
      })),
    },
  };
}

export async function submitSurveyResponse(
  input: SubmitSurveyResponseInput,
): Promise<StudentSurveyActionResult<{ responseId: string }>> {
  const authResult = await requireStudentSession();

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const parsed = submitSurveyResponseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Podaci ankete nisu valjani.",
    };
  }

  const student = await getStudentProfile(authResult.session.user.id);

  if (!student) {
    return { success: false, message: "Studentski profil nije pronađen." };
  }

  if (!student.studyProgram || student.yearOfStudy === null) {
    return {
      success: false,
      message:
        "Vašem profilu nedostaje studijski smjer ili godina studija. Obratite se podršci.",
    };
  }

  const normalizedStudentProgram = normalizeStudyProgram(student.studyProgram);

  if (!normalizedStudentProgram) {
    return {
      success: false,
      message:
        "Vašem profilu nedostaje valjan studijski smjer. Obratite se podršci.",
    };
  }

  const survey = await prisma.survey.findFirst({
    where: {
      id: parsed.data.surveyId,
      ...buildSurveyTargetingFilter(normalizedStudentProgram, student.yearOfStudy),
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!survey) {
    return {
      success: false,
      message: "Anketa nije pronađena ili nije dostupna za vaš profil.",
    };
  }

  const validationResult = validateSubmissionAgainstSurvey(
    survey.questions.map((question) => ({
      id: question.id,
      type: question.type,
      isRequired: question.isRequired,
      options: question.options.map((option) => ({ id: option.id })),
    })),
    parsed.data,
  );

  if (!validationResult.success) {
    return {
      success: false,
      message:
        validationResult.error.issues[0]?.message ??
        "Ispunite sva obavezna pitanja.",
    };
  }

  const submittedQuestionIds = new Set(
    parsed.data.answers.map((answer) => answer.questionId),
  );

  for (const question of survey.questions) {
    if (!submittedQuestionIds.has(question.id)) {
      return {
        success: false,
        message: "Odgovorite na sva pitanja u anketi.",
      };
    }
  }

  try {
    const response = await prisma.$transaction(async (tx) => {
      const duplicate = await tx.response.findUnique({
        where: {
          surveyId_studentId: {
            surveyId: survey.id,
            studentId: student.id,
          },
        },
      });

      if (duplicate) {
        throw new Error("DUPLICATE_SUBMISSION");
      }

      return tx.response.create({
        data: {
          surveyId: survey.id,
          studentId: student.id,
          studentYear: student.yearOfStudy!,
          studentProgram: normalizedStudentProgram,
          answers: {
            create: parsed.data.answers.map((answer) => ({
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId ?? null,
              textValue: answer.textValue ?? null,
              ratingValue: answer.ratingValue ?? null,
            })),
          },
        },
      });
    });

    revalidatePath("/surveys");
    revalidatePath(`/surveys/${survey.id}`);

    return {
      success: true,
      message: "Anketa je uspješno poslana. Hvala na povratnim informacijama!",
      data: { responseId: response.id },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_SUBMISSION") {
      return {
        success: false,
        message: "Već ste poslali ovu anketu.",
      };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Već ste poslali ovu anketu.",
      };
    }

    return {
      success: false,
      message: "Došlo je do greške pri slanju ankete.",
    };
  }
}
