import { QuestionType } from "@prisma/client";
import { z } from "zod";

export type SurveyQuestionForValidation = {
  id: string;
  type: QuestionType;
  isRequired: boolean;
  options: { id: string }[];
};

export const submitSurveyResponseSchema = z.object({
  surveyId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionId: z.string().optional(),
      selectedOptionIds: z.array(z.string()).optional(),
      textValue: z.string().optional(),
      ratingValue: z.number().int().min(1).max(5).optional(),
    }),
  ),
});

export type SubmitSurveyResponseInput = z.infer<typeof submitSurveyResponseSchema>;

export type SurveyAnswerFormValue = {
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textValue?: string;
  ratingValue?: number;
};

export type SurveyResponseFormValues = {
  answers: Record<string, SurveyAnswerFormValue>;
};

export function buildSurveyResponseFormSchema(
  questions: SurveyQuestionForValidation[],
) {
  return z
    .object({
      answers: z.record(z.string(), z.any()),
    })
    .superRefine((values, ctx) => {
      for (const question of questions) {
        const answer = values.answers[question.id];

        if (!answer) {
          if (question.isRequired) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "This question is required",
              path: ["answers", question.id],
            });
          }
          continue;
        }

        switch (question.type) {
          case QuestionType.SINGLE_CHOICE: {
            if (!answer.selectedOptionId) {
              if (question.isRequired) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Please select an option",
                  path: ["answers", question.id, "selectedOptionId"],
                });
              }
            } else if (
              !question.options.some(
                (option) => option.id === answer.selectedOptionId,
              )
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid option selected",
                path: ["answers", question.id, "selectedOptionId"],
              });
            }
            break;
          }
          case QuestionType.MULTIPLE_CHOICE: {
            const selected = answer.selectedOptionIds ?? [];
            if (selected.length === 0 && question.isRequired) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Select at least one option",
                path: ["answers", question.id, "selectedOptionIds"],
              });
            }

            for (const optionId of selected) {
              if (!question.options.some((option) => option.id === optionId)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Invalid option selected",
                  path: ["answers", question.id, "selectedOptionIds"],
                });
              }
            }
            break;
          }
          case QuestionType.TEXT: {
            const text = answer.textValue?.trim() ?? "";
            if (!text && question.isRequired) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please enter a response",
                path: ["answers", question.id, "textValue"],
              });
            }
            break;
          }
          case QuestionType.RATING_1_5: {
            const rating = answer.ratingValue;
            if (
              (rating === undefined || Number.isNaN(rating)) &&
              question.isRequired
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please provide a rating",
                path: ["answers", question.id, "ratingValue"],
              });
            } else if (
              rating !== undefined &&
              (rating < 1 || rating > 5)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Rating must be between 1 and 5",
                path: ["answers", question.id, "ratingValue"],
              });
            }
            break;
          }
        }
      }
    });
}

export function mapFormValuesToSubmission(
  surveyId: string,
  questions: SurveyQuestionForValidation[],
  formValues: SurveyResponseFormValues,
): SubmitSurveyResponseInput {
  const answers = questions.flatMap((question) => {
    const answer = formValues.answers[question.id];
    if (!answer) {
      return [];
    }

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
        return answer.selectedOptionId
          ? [
              {
                questionId: question.id,
                selectedOptionId: answer.selectedOptionId,
              },
            ]
          : [];
      case QuestionType.MULTIPLE_CHOICE:
        return (answer.selectedOptionIds ?? []).map((optionId) => ({
          questionId: question.id,
          selectedOptionId: optionId,
        }));
      case QuestionType.TEXT:
        return answer.textValue?.trim()
          ? [
              {
                questionId: question.id,
                textValue: answer.textValue.trim(),
              },
            ]
          : [];
      case QuestionType.RATING_1_5:
        return answer.ratingValue !== undefined
          ? [
              {
                questionId: question.id,
                ratingValue: answer.ratingValue,
              },
            ]
          : [];
      default:
        return [];
    }
  });

  return { surveyId, answers };
}

export function validateSubmissionAgainstSurvey(
  questions: SurveyQuestionForValidation[],
  input: SubmitSurveyResponseInput,
) {
  const formValues: SurveyResponseFormValues = { answers: {} };

  for (const question of questions) {
    const questionAnswers = input.answers.filter(
      (answer) => answer.questionId === question.id,
    );

    if (questionAnswers.length === 0) {
      continue;
    }

    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
        formValues.answers[question.id] = {
          selectedOptionId: questionAnswers[0]?.selectedOptionId,
        };
        break;
      case QuestionType.MULTIPLE_CHOICE:
        formValues.answers[question.id] = {
          selectedOptionIds: questionAnswers
            .map((answer) => answer.selectedOptionId)
            .filter((id): id is string => !!id),
        };
        break;
      case QuestionType.TEXT:
        formValues.answers[question.id] = {
          textValue: questionAnswers[0]?.textValue,
        };
        break;
      case QuestionType.RATING_1_5:
        formValues.answers[question.id] = {
          ratingValue: questionAnswers[0]?.ratingValue,
        };
        break;
    }
  }

  return buildSurveyResponseFormSchema(questions).safeParse(formValues);
}
