import { QuestionType } from "@prisma/client";
import { z } from "zod";

export const questionTypeSchema = z.nativeEnum(QuestionType);

export const questionOptionSchema = z.object({
  text: z.string().trim().min(1, "Option text is required"),
  order: z.number().int().min(0),
});

export const questionSchema = z
  .object({
    text: z.string().trim().min(1, "Question text is required"),
    type: questionTypeSchema,
    isRequired: z.boolean(),
    order: z.number().int().min(0),
    options: z.array(questionOptionSchema).optional(),
  })
  .superRefine((question, ctx) => {
    const isChoiceQuestion =
      question.type === QuestionType.SINGLE_CHOICE ||
      question.type === QuestionType.MULTIPLE_CHOICE;

    if (isChoiceQuestion) {
      if (!question.options || question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Choice questions require at least 2 options",
          path: ["options"],
        });
      }
    }
  });

export const createSurveySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  description: z.string().trim().min(1, "Description is required"),
  subject: z.string().trim().optional(),
  targetProgram: z.string().trim().optional(),
  targetYear: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? undefined
        : Number(value),
    z
      .number()
      .int()
      .min(1, "Target year must be between 1 and 6")
      .max(6, "Target year must be between 1 and 6")
      .optional(),
  ),
  questions: z
    .array(questionSchema)
    .min(1, "Add at least one question"),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type SurveyQuestionInput = z.infer<typeof questionSchema>;
export type SurveyQuestionOptionInput = z.infer<typeof questionOptionSchema>;

export const QUESTION_TYPE_OPTIONS = [
  { value: QuestionType.SINGLE_CHOICE, label: "Single choice" },
  { value: QuestionType.MULTIPLE_CHOICE, label: "Multiple choice" },
  { value: QuestionType.TEXT, label: "Free text" },
  { value: QuestionType.RATING_1_5, label: "Rating (1–5)" },
] as const;
