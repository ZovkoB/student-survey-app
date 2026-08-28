"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

import {
  submitSurveyResponse,
  type SurveyForFill,
} from "@/app/actions/student-surveys";
import { RatingInput } from "@/components/survey/rating-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatYearLabel } from "@/lib/i18n/hr";
import {
  buildSurveyResponseFormSchema,
  mapFormValuesToSubmission,
  type SurveyResponseFormValues,
} from "@/lib/validations/student-survey";

type SurveyFillerFormProps = {
  survey: SurveyForFill;
};

const optionClassName =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition-colors hover:border-indigo-200 hover:bg-slate-50";

const textareaClassName =
  "w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0";

function MetadataBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function getDefaultValues(survey: SurveyForFill): SurveyResponseFormValues {
  const answers: SurveyResponseFormValues["answers"] = {};

  for (const question of survey.questions) {
    answers[question.id] =
      question.type === QuestionType.MULTIPLE_CHOICE
        ? { selectedOptionIds: [] }
        : {};
  }

  return { answers };
}

function getQuestionErrorMessage(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  if (typeof error === "object" && error !== null) {
    for (const value of Object.values(error)) {
      const nested = getQuestionErrorMessage(value);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

function getQuestionInstruction(type: QuestionType): string {
  switch (type) {
    case QuestionType.SINGLE_CHOICE:
      return "Odaberite jednu opciju";
    case QuestionType.MULTIPLE_CHOICE:
      return "Odaberite sve primjenjive opcije";
    case QuestionType.TEXT:
      return "Unesite odgovor";
    case QuestionType.RATING_1_5:
      return "Ocijenite od 1 do 5 zvjezdica";
    default:
      return "";
  }
}

export function SurveyFillerForm({ survey }: SurveyFillerFormProps) {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const validationQuestions = useMemo(
    () =>
      survey.questions.map((question) => ({
        id: question.id,
        type: question.type,
        isRequired: question.isRequired,
        options: question.options.map((option) => ({ id: option.id })),
      })),
    [survey.questions],
  );

  const schema = useMemo(
    () => buildSurveyResponseFormSchema(validationQuestions),
    [validationQuestions],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SurveyResponseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(survey),
  });

  async function onSubmit(values: SurveyResponseFormValues) {
    const payload = mapFormValuesToSubmission(
      survey.id,
      validationQuestions,
      values,
    );

    const result = await submitSurveyResponse(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIsSuccess(true);

    setTimeout(() => {
      router.push("/surveys");
      router.refresh();
    }, 1500);
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Odgovor je primljen</h2>
        <p className="text-sm text-slate-600">
          Hvala što ste ispunili anketu „{survey.title}". Preusmjeravamo vas natrag
          na popis anketa...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">{survey.title}</h1>
        <p className="mb-4 text-sm text-slate-600">{survey.description}</p>
        <div className="flex flex-wrap gap-2">
          {survey.subject && <MetadataBadge>Predmet: {survey.subject}</MetadataBadge>}
          {survey.targetProgram && (
            <MetadataBadge>Smjer: {survey.targetProgram}</MetadataBadge>
          )}
          {survey.targetYear && (
            <MetadataBadge>{formatYearLabel(survey.targetYear)}</MetadataBadge>
          )}
        </div>
      </div>

      {survey.questions.map((question, index) => {
        const questionError = getQuestionErrorMessage(
          errors.answers?.[question.id],
        );

        return (
          <div
            key={question.id}
            className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="flex items-center gap-1 text-base font-semibold text-slate-900">
                <span>
                  {index + 1}. {question.text}
                </span>
                {question.isRequired && (
                  <span className="text-rose-500">*</span>
                )}
              </p>
              <p className="mt-1 text-xs font-normal text-slate-500">
                {getQuestionInstruction(question.type)}
              </p>
            </div>

            <div className="space-y-3">
              {question.type === QuestionType.SINGLE_CHOICE && (
                <Controller
                  control={control}
                  name={`answers.${question.id}.selectedOptionId`}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          htmlFor={`${question.id}-${option.id}`}
                          className={optionClassName}
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={`${question.id}-${option.id}`}
                          />
                          <span className="text-sm font-medium text-slate-800">
                            {option.text}
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              )}

              {question.type === QuestionType.MULTIPLE_CHOICE && (
                <Controller
                  control={control}
                  name={`answers.${question.id}.selectedOptionIds`}
                  render={({ field }) => {
                    const selectedValues = field.value ?? [];

                    return (
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const checked = selectedValues.includes(option.id);

                          return (
                            <label
                              key={option.id}
                              htmlFor={`${question.id}-${option.id}`}
                              className={optionClassName}
                            >
                              <Checkbox
                                id={`${question.id}-${option.id}`}
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  if (isChecked) {
                                    field.onChange([...selectedValues, option.id]);
                                  } else {
                                    field.onChange(
                                      selectedValues.filter(
                                        (value) => value !== option.id,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm font-medium text-slate-800">
                                {option.text}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              )}

              {question.type === QuestionType.TEXT && (
                <Controller
                  control={control}
                  name={`answers.${question.id}.textValue`}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Upišite odgovor ovdje..."
                      className={textareaClassName}
                    />
                  )}
                />
              )}

              {question.type === QuestionType.RATING_1_5 && (
                <Controller
                  control={control}
                  name={`answers.${question.id}.ratingValue`}
                  render={({ field }) => (
                    <RatingInput value={field.value} onChange={field.onChange} />
                  )}
                />
              )}

              {questionError && (
                <Alert variant="destructive">
                  <AlertDescription>{questionError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/surveys"
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Natrag na ankete
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#5c4eb4] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Slanje..." : "Predaj anketu"}
        </button>
      </div>
    </form>
  );
}
