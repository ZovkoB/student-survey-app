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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  buildSurveyResponseFormSchema,
  mapFormValuesToSubmission,
  type SurveyResponseFormValues,
} from "@/lib/validations/student-survey";

type SurveyFillerFormProps = {
  survey: SurveyForFill;
};

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
      <Card>
        <CardHeader>
          <CardTitle>Submission received</CardTitle>
          <CardDescription>
            Thank you for completing &quot;{survey.title}&quot;. Redirecting
            you back to your survey list...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {survey.subject && <p>Subject: {survey.subject}</p>}
          {survey.targetProgram && <p>Program: {survey.targetProgram}</p>}
          {survey.targetYear && <p>Target year: {survey.targetYear}</p>}
        </CardContent>
      </Card>

      {survey.questions.map((question, index) => {
        const questionError = getQuestionErrorMessage(
          errors.answers?.[question.id],
        );

        return (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {index + 1}. {question.text}
                {question.isRequired && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </CardTitle>
              <CardDescription>
                {question.type === QuestionType.SINGLE_CHOICE &&
                  "Select one option"}
                {question.type === QuestionType.MULTIPLE_CHOICE &&
                  "Select all that apply"}
                {question.type === QuestionType.TEXT && "Enter your answer"}
                {question.type === QuestionType.RATING_1_5 &&
                  "Rate from 1 to 5 stars"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
                          className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent/50"
                        >
                          <RadioGroupItem
                            value={option.id}
                            id={`${question.id}-${option.id}`}
                          />
                          <span className="text-sm">{option.text}</span>
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
                              className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent/50"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  if (isChecked) {
                                    field.onChange([
                                      ...selectedValues,
                                      option.id,
                                    ]);
                                  } else {
                                    field.onChange(
                                      selectedValues.filter(
                                        (value) => value !== option.id,
                                      ),
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm">{option.text}</span>
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
                      placeholder="Type your answer here..."
                    />
                  )}
                />
              )}

              {question.type === QuestionType.RATING_1_5 && (
                <Controller
                  control={control}
                  name={`answers.${question.id}.ratingValue`}
                  render={({ field }) => (
                    <RatingInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              )}

              {questionError && (
                <Alert variant="destructive">
                  <AlertDescription>{questionError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline" type="button">
          <Link href="/surveys">
            <ChevronLeft className="h-4 w-4" />
            Back to surveys
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit survey"}
        </Button>
      </div>
    </form>
  );
}
