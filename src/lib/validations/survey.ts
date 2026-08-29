import { QuestionType } from "@prisma/client";
import { z } from "zod";

import { STUDY_PROGRAM_OPTIONS } from "@/lib/study-program";

export const questionTypeSchema = z.nativeEnum(QuestionType);

export const questionOptionSchema = z.object({
  text: z.string().trim().min(1, "Tekst opcije je obavezan"),
  order: z.number().int().min(0),
});

export const questionSchema = z
  .object({
    text: z.string().trim().min(1, "Tekst pitanja je obavezan"),
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
          message: "Pitanja s izborom moraju imati najmanje 2 opcije",
          path: ["options"],
        });
      }
    }
  });

export const createSurveySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Naslov je obavezan")
    .max(200, "Naslov smije imati najviše 200 znakova"),
  description: z.string().trim().min(1, "Opis je obavezan"),
  subject: z.string().trim().optional(),
  targetProgram: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine(
      (value) =>
        value === undefined ||
        STUDY_PROGRAM_OPTIONS.includes(
          value as (typeof STUDY_PROGRAM_OPTIONS)[number],
        ),
      "Odaberite valjan studijski smjer",
    ),
  targetYear: z.preprocess(
    (value) =>
      value === "" || value === null || value === undefined
        ? undefined
        : Number(value),
    z
      .number()
      .int()
      .min(1, "Ciljana godina mora biti između 1 i 5")
      .max(5, "Ciljana godina mora biti između 1 i 5")
      .optional(),
  ),
  questions: z
    .array(questionSchema)
    .min(1, "Dodajte barem jedno pitanje"),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
export type SurveyQuestionInput = z.infer<typeof questionSchema>;
export type SurveyQuestionOptionInput = z.infer<typeof questionOptionSchema>;

export const QUESTION_TYPE_OPTIONS = [
  { value: QuestionType.SINGLE_CHOICE, label: "Jedan izbor" },
  { value: QuestionType.MULTIPLE_CHOICE, label: "Više izbora" },
  { value: QuestionType.TEXT, label: "Slobodan tekst" },
  { value: QuestionType.RATING_1_5, label: "Ocjena (1–5)" },
] as const;
