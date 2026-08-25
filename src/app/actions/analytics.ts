"use server";

import { QuestionType } from "@prisma/client";

import { getAdminSurveyWhere, requireAdminUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export type AnalyticsActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

export type DemographicBucket = {
  label: string;
  count: number;
  percentage: number;
};

export type ChoiceOptionStat = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

export type RatingDistributionStat = {
  rating: number;
  count: number;
  percentage: number;
};

export type TextResponseItem = {
  text: string;
  submittedAt: string;
  studentProgram: string;
  studentYear: number;
};

export type ChoiceQuestionAnalytics = {
  id: string;
  text: string;
  type: QuestionType.SINGLE_CHOICE | QuestionType.MULTIPLE_CHOICE;
  order: number;
  totalAnswers: number;
  options: ChoiceOptionStat[];
};

export type RatingQuestionAnalytics = {
  id: string;
  text: string;
  type: QuestionType.RATING_1_5;
  order: number;
  average: number;
  median: number;
  totalAnswers: number;
  distribution: RatingDistributionStat[];
};

export type TextQuestionAnalytics = {
  id: string;
  text: string;
  type: QuestionType.TEXT;
  order: number;
  totalAnswers: number;
  recentResponses: TextResponseItem[];
};

export type QuestionAnalytics =
  | ChoiceQuestionAnalytics
  | RatingQuestionAnalytics
  | TextQuestionAnalytics;

export type SurveyAnalyticsData = {
  survey: {
    id: string;
    title: string;
    description: string;
    subject: string | null;
    isActive: boolean;
  };
  summary: {
    totalResponses: number;
    averageRating: number | null;
    topProgram: { label: string; count: number } | null;
  };
  demographics: {
    programs: DemographicBucket[];
    years: DemographicBucket[];
  };
  questions: QuestionAnalytics[];
};

const TEXT_RESPONSES_LIMIT = 20;

async function requireAdminOwner(surveyId: string) {
  const authResult = await requireAdminUser();

  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      ...getAdminSurveyWhere(
        authResult.admin.id,
        authResult.admin.email,
      ),
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
      responses: {
        orderBy: { submittedAt: "desc" },
        include: {
          answers: {
            include: {
              selectedOption: true,
              question: true,
            },
          },
        },
      },
    },
  });

  if (!survey) {
    return { error: "Survey not found or you do not have access." as const };
  }

  return { survey, admin: authResult.admin } as const;
}

function calculateMedian(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle]!;
}

function buildDemographics(
  responses: { studentProgram: string; studentYear: number }[],
) {
  const totalResponses = responses.length;

  const programCounts = new Map<string, number>();
  const yearCounts = new Map<number, number>();

  for (const response of responses) {
    programCounts.set(
      response.studentProgram,
      (programCounts.get(response.studentProgram) ?? 0) + 1,
    );
    yearCounts.set(
      response.studentYear,
      (yearCounts.get(response.studentYear) ?? 0) + 1,
    );
  }

  const programs = Array.from(programCounts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const years = Array.from(yearCounts.entries())
    .map(([year, count]) => ({
      label: `Year ${year}`,
      count,
      percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
    }))
    .sort((a, b) => Number(a.label.replace("Year ", "")) - Number(b.label.replace("Year ", "")));

  return { programs, years };
}

function buildQuestionAnalytics(
  question: {
    id: string;
    text: string;
    type: QuestionType;
    order: number;
    options: { id: string; text: string }[];
  },
  responses: {
    submittedAt: Date;
    studentProgram: string;
    studentYear: number;
    answers: {
      questionId: string;
      selectedOptionId: string | null;
      textValue: string | null;
      ratingValue: number | null;
      selectedOption: { id: string; text: string } | null;
    }[];
  }[],
): QuestionAnalytics {
  const answersForQuestion = responses.flatMap((response) =>
    response.answers
      .filter((answer) => answer.questionId === question.id)
      .map((answer) => ({
        ...answer,
        submittedAt: response.submittedAt,
        studentProgram: response.studentProgram,
        studentYear: response.studentYear,
      })),
  );

  if (
    question.type === QuestionType.SINGLE_CHOICE ||
    question.type === QuestionType.MULTIPLE_CHOICE
  ) {
    const optionCounts = new Map<string, number>();

    for (const option of question.options) {
      optionCounts.set(option.id, 0);
    }

    for (const answer of answersForQuestion) {
      if (answer.selectedOptionId) {
        optionCounts.set(
          answer.selectedOptionId,
          (optionCounts.get(answer.selectedOptionId) ?? 0) + 1,
        );
      }
    }

    const totalAnswers = answersForQuestion.length;

    return {
      id: question.id,
      text: question.text,
      type: question.type,
      order: question.order,
      totalAnswers,
      options: question.options.map((option) => {
        const count = optionCounts.get(option.id) ?? 0;
        return {
          id: option.id,
          label: option.text,
          count,
          percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0,
        };
      }),
    };
  }

  if (question.type === QuestionType.RATING_1_5) {
    const ratings = answersForQuestion
      .map((answer) => answer.ratingValue)
      .filter((value): value is number => value !== null && value !== undefined);

    const distributionMap = new Map<number, number>([
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
    ]);

    for (const rating of ratings) {
      distributionMap.set(rating, (distributionMap.get(rating) ?? 0) + 1);
    }

    const totalAnswers = ratings.length;
    const average =
      totalAnswers > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / totalAnswers
        : 0;

    return {
      id: question.id,
      text: question.text,
      type: question.type,
      order: question.order,
      average,
      median: calculateMedian(ratings),
      totalAnswers,
      distribution: Array.from(distributionMap.entries()).map(
        ([rating, count]) => ({
          rating,
          count,
          percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0,
        }),
      ),
    };
  }

  const textResponses = answersForQuestion
    .filter((answer) => answer.textValue?.trim())
    .map((answer) => ({
      text: answer.textValue!.trim(),
      submittedAt: answer.submittedAt.toISOString(),
      studentProgram: answer.studentProgram,
      studentYear: answer.studentYear,
    }));

  return {
    id: question.id,
    text: question.text,
    type: QuestionType.TEXT,
    order: question.order,
    totalAnswers: textResponses.length,
    recentResponses: textResponses.slice(0, TEXT_RESPONSES_LIMIT),
  };
}

export async function getSurveyAnalytics(
  surveyId: string,
): Promise<AnalyticsActionResult<SurveyAnalyticsData>> {
  const authResult = await requireAdminOwner(surveyId);

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const { survey } = authResult;
  const totalResponses = survey.responses.length;
  const demographics = buildDemographics(survey.responses);

  const allRatings = survey.responses.flatMap((response) =>
    response.answers
      .filter((answer) => answer.ratingValue !== null)
      .map((answer) => answer.ratingValue!),
  );

  const averageRating =
    allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : null;

  const topProgram =
    demographics.programs.length > 0
      ? {
          label: demographics.programs[0]!.label,
          count: demographics.programs[0]!.count,
        }
      : null;

  const questions = survey.questions.map((question) =>
    buildQuestionAnalytics(question, survey.responses),
  );

  return {
    success: true,
    message: "Analytics loaded successfully.",
    data: {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        subject: survey.subject,
        isActive: survey.isActive,
      },
      summary: {
        totalResponses,
        averageRating,
        topProgram,
      },
      demographics,
      questions,
    },
  };
}

function escapeCsvValue(value: string | number | null | undefined) {
  const stringValue = value === null || value === undefined ? "" : String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function formatAnswerValue(
  answers: {
    selectedOption: { text: string } | null;
    textValue: string | null;
    ratingValue: number | null;
  }[],
  questionType: QuestionType,
) {
  if (questionType === QuestionType.TEXT) {
    return answers[0]?.textValue ?? "";
  }

  if (questionType === QuestionType.RATING_1_5) {
    return answers[0]?.ratingValue?.toString() ?? "";
  }

  return answers
    .map((answer) => answer.selectedOption?.text ?? "")
    .filter(Boolean)
    .join("; ");
}

export async function exportSurveyDataCsv(
  surveyId: string,
): Promise<AnalyticsActionResult<{ csv: string; filename: string }>> {
  const authResult = await requireAdminOwner(surveyId);

  if ("error" in authResult) {
    return { success: false, message: authResult.error };
  }

  const { survey } = authResult;

  const headers = [
    "Response ID",
    "Submitted At",
    "Student Program",
    "Student Year",
    ...survey.questions.map((question) => question.text),
  ];

  const rows = survey.responses.map((response) => {
    const baseColumns = [
      response.id,
      response.submittedAt.toISOString(),
      response.studentProgram,
      response.studentYear,
    ];

    const questionColumns = survey.questions.map((question) => {
      const answers = response.answers.filter(
        (answer) => answer.questionId === question.id,
      );

      return formatAnswerValue(answers, question.type);
    });

    return [...baseColumns, ...questionColumns]
      .map((value) => escapeCsvValue(value))
      .join(",");
  });

  const csv = [headers.map((header) => escapeCsvValue(header)).join(","), ...rows].join(
    "\n",
  );

  const filename = `${survey.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-responses.csv`;

  return {
    success: true,
    message: "CSV export generated successfully.",
    data: { csv, filename },
  };
}
