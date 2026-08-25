"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { createSurvey } from "@/app/actions/surveys";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createSurveySchema,
  QUESTION_TYPE_OPTIONS,
  type CreateSurveyInput,
} from "@/lib/validations/survey";

function createDefaultQuestion(order: number): CreateSurveyInput["questions"][number] {
  return {
    text: "",
    type: QuestionType.SINGLE_CHOICE,
    isRequired: true,
    order,
    options: [
      { text: "", order: 0 },
      { text: "", order: 1 },
    ],
  };
}

function isChoiceQuestion(type: QuestionType) {
  return (
    type === QuestionType.SINGLE_CHOICE ||
    type === QuestionType.MULTIPLE_CHOICE
  );
}

function QuestionOptionsEditor({
  questionIndex,
  control,
  register,
  errors,
}: {
  questionIndex: number;
  control: ReturnType<typeof useForm<CreateSurveyInput>>["control"];
  register: ReturnType<typeof useForm<CreateSurveyInput>>["register"];
  errors: ReturnType<typeof useForm<CreateSurveyInput>>["formState"]["errors"];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <div className="space-y-3">
      <Label>Answer options</Label>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-start gap-2">
          <Input
            {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
            placeholder={`Option ${optionIndex + 1}`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={fields.length <= 2}
            onClick={() => remove(optionIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {errors.questions?.[questionIndex]?.options?.message && (
        <p className="text-sm text-destructive">
          {errors.questions[questionIndex]?.options?.message}
        </p>
      )}
      {errors.questions?.[questionIndex]?.options?.root?.message && (
        <p className="text-sm text-destructive">
          {errors.questions[questionIndex]?.options?.root?.message}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({
            text: "",
            order: fields.length,
          })
        }
      >
        <Plus className="h-4 w-4" />
        Add option
      </Button>
    </div>
  );
}

function QuestionCard({
  questionIndex,
  control,
  register,
  setValue,
  removeQuestion,
  canRemove,
  errors,
}: {
  questionIndex: number;
  control: ReturnType<typeof useForm<CreateSurveyInput>>["control"];
  register: ReturnType<typeof useForm<CreateSurveyInput>>["register"];
  setValue: ReturnType<typeof useForm<CreateSurveyInput>>["setValue"];
  removeQuestion: (index: number) => void;
  canRemove: boolean;
  errors: ReturnType<typeof useForm<CreateSurveyInput>>["formState"]["errors"];
}) {
  const questionType = useWatch({
    control,
    name: `questions.${questionIndex}.type`,
  });

  const isRequired = useWatch({
    control,
    name: `questions.${questionIndex}.isRequired`,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            Question {questionIndex + 1}
          </CardTitle>
          <CardDescription>
            Configure the question text, type, and answer choices.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canRemove}
          onClick={() => removeQuestion(questionIndex)}
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${questionIndex}`}>Question text</Label>
          <Input
            id={`question-text-${questionIndex}`}
            {...register(`questions.${questionIndex}.text`)}
            placeholder="Enter your question"
          />
          {errors.questions?.[questionIndex]?.text && (
            <p className="text-sm text-destructive">
              {errors.questions[questionIndex]?.text?.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Question type</Label>
            <Select
              value={questionType}
              onValueChange={(value: QuestionType) => {
                setValue(`questions.${questionIndex}.type`, value, {
                  shouldValidate: true,
                });

                if (isChoiceQuestion(value)) {
                  setValue(`questions.${questionIndex}.options`, [
                    { text: "", order: 0 },
                    { text: "", order: 1 },
                  ]);
                } else {
                  setValue(`questions.${questionIndex}.options`, undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={isRequired}
                onCheckedChange={(checked) =>
                  setValue(
                    `questions.${questionIndex}.isRequired`,
                    checked === true,
                    { shouldValidate: true },
                  )
                }
              />
              Required question
            </label>
          </div>
        </div>

        {isChoiceQuestion(questionType) && (
          <QuestionOptionsEditor
            questionIndex={questionIndex}
            control={control}
            register={register}
            errors={errors}
          />
        )}

        {questionType === QuestionType.RATING_1_5 && (
          <p className="text-sm text-muted-foreground">
            Students will rate this question on a scale from 1 to 5.
          </p>
        )}

        {questionType === QuestionType.TEXT && (
          <p className="text-sm text-muted-foreground">
            Students will provide a free-text answer for this question.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SurveyBuilderForm() {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateSurveyInput>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      targetProgram: "",
      targetYear: undefined,
      questions: [createDefaultQuestion(0)],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  async function onSubmit(values: CreateSurveyInput) {
    const normalizedQuestions = values.questions.map((question, index) => ({
      ...question,
      order: index,
      options: isChoiceQuestion(question.type)
        ? question.options?.map((option, optionIndex) => ({
            ...option,
            order: optionIndex,
          }))
        : undefined,
    }));

    const result = await createSurvey({
      ...values,
      questions: normalizedQuestions,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {errors.questions?.message && (
        <Alert variant="destructive">
          <AlertDescription>{errors.questions.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Survey details</CardTitle>
          <CardDescription>
            Basic information and targeting rules for this survey.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Course feedback survey" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Explain the purpose of this survey"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input id="subject" {...register("subject")} placeholder="Mathematics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetProgram">Target program (optional)</Label>
              <Input
                id="targetProgram"
                {...register("targetProgram")}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetYear">Target year (optional)</Label>
              <Input
                id="targetYear"
                type="number"
                min={1}
                max={6}
                {...register("targetYear")}
                placeholder="3"
              />
              {errors.targetYear && (
                <p className="text-sm text-destructive">
                  {errors.targetYear.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Questions</h2>
            <p className="text-sm text-muted-foreground">
              Add and configure the questions students will answer.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => appendQuestion(createDefaultQuestion(questionFields.length))}
          >
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>

        {questionFields.map((field, index) => (
          <QuestionCard
            key={field.id}
            questionIndex={index}
            control={control}
            register={register}
            setValue={setValue}
            removeQuestion={removeQuestion}
            canRemove={questionFields.length > 1}
            errors={errors}
          />
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" type="button">
          <Link href="/admin/dashboard">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating survey..." : "Create survey"}
        </Button>
      </div>
    </form>
  );
}
