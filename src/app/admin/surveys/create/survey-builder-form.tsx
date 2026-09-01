"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { createSurvey } from "@/app/actions/surveys";
import { STUDY_PROGRAM_OPTIONS } from "@/lib/study-program";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import {
  createSurveySchema,
  QUESTION_TYPE_OPTIONS,
  type CreateSurveyInput,
} from "@/lib/validations/survey";

const cardClassName =
  "w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6";

const inputClassName =
  "rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#5c4eb4] focus:ring-2 focus:ring-[#5c4eb4]/10 focus-visible:ring-offset-0";

const selectTriggerClassName =
  "rounded-xl border-slate-300 bg-white text-slate-900 focus:border-[#5c4eb4] focus:ring-2 focus:ring-[#5c4eb4]/10 focus:ring-offset-0";

const labelClassName = "text-sm font-medium text-slate-700";

const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#5c4eb4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

const removeButtonClassName =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200/60 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60";

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
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <Label className={labelClassName}>Opcije odgovora</Label>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-start gap-2">
          <Input
            {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
            placeholder={`Opcija ${optionIndex + 1}`}
            className={inputClassName}
          />
          <button
            type="button"
            disabled={fields.length <= 2}
            onClick={() => remove(optionIndex)}
            className={cn(removeButtonClassName, "shrink-0 px-2.5 py-2")}
            aria-label={`Ukloni opciju ${optionIndex + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {errors.questions?.[questionIndex]?.options?.message && (
        <p className="text-sm text-rose-600">
          {errors.questions[questionIndex]?.options?.message}
        </p>
      )}
      {errors.questions?.[questionIndex]?.options?.root?.message && (
        <p className="text-sm text-rose-600">
          {errors.questions[questionIndex]?.options?.root?.message}
        </p>
      )}
      <button
        type="button"
        onClick={() =>
          append({
            text: "",
            order: fields.length,
          })
        }
        className={secondaryButtonClassName}
      >
        <Plus className="h-4 w-4" />
        Dodaj opciju
      </button>
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
    <div className={cardClassName}>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <GripVertical className="h-4 w-4 text-slate-400" />
            Pitanje {questionIndex + 1}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Postavite tekst pitanja, vrstu i opcije odgovora.
          </p>
        </div>
        <button
          type="button"
          disabled={!canRemove}
          onClick={() => removeQuestion(questionIndex)}
          className={removeButtonClassName}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Ukloni
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${questionIndex}`} className={labelClassName}>
            Tekst pitanja
          </Label>
          <Input
            id={`question-text-${questionIndex}`}
            {...register(`questions.${questionIndex}.text`)}
            placeholder="Unesite pitanje"
            className={inputClassName}
          />
          {errors.questions?.[questionIndex]?.text && (
            <p className="text-sm text-rose-600">
              {errors.questions[questionIndex]?.text?.message}
            </p>
          )}
        </div>

        <div className="app-grid-2">
          <div className="min-w-0 space-y-2">
            <Label className={labelClassName}>Vrsta pitanja</Label>
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
              <SelectTrigger className={selectTriggerClassName}>
                <SelectValue placeholder="Odaberite vrstu" />
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

          <div className="flex min-w-0 items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
              Obavezno pitanje
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
          <p className="text-sm text-slate-500">
            Studenti će ocijeniti ovo pitanje na ljestvici od 1 do 5.
          </p>
        )}

        {questionType === QuestionType.TEXT && (
          <p className="text-sm text-slate-500">
            Studenti će dati slobodan tekstualni odgovor na ovo pitanje.
          </p>
        )}
      </div>
    </div>
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

  const targetProgram = useWatch({ control, name: "targetProgram" });
  const targetYear = useWatch({ control, name: "targetYear" });

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.questions?.message && (
        <Alert variant="destructive">
          <AlertDescription>{errors.questions.message}</AlertDescription>
        </Alert>
      )}

      <div className={cardClassName}>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Detalji ankete</h2>
          <p className="mt-1 text-sm text-slate-500">
            Osnovne informacije i pravila ciljanja za ovu anketu.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className={labelClassName}>
              Naslov
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Anketa o kvaliteti nastave"
              className={inputClassName}
            />
            {errors.title && (
              <p className="text-sm text-rose-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={labelClassName}>
              Opis
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Opišite svrhu ove ankete"
              rows={4}
              className={inputClassName}
            />
            {errors.description && (
              <p className="text-sm text-rose-600">{errors.description.message}</p>
            )}
          </div>

          <div className="app-grid-3">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="subject" className={labelClassName}>
                Predmet (neobavezno)
              </Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="Matematika"
                className={inputClassName}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="targetProgram" className={labelClassName}>
                Ciljani smjer (neobavezno)
              </Label>
              <Select
                value={targetProgram?.trim() ? targetProgram : "all"}
                onValueChange={(value) =>
                  setValue("targetProgram", value === "all" ? "" : value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="targetProgram" className={selectTriggerClassName}>
                  <SelectValue placeholder="Svi smjerovi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi smjerovi</SelectItem>
                  {STUDY_PROGRAM_OPTIONS.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetProgram && (
                <p className="text-sm text-rose-600">{errors.targetProgram.message}</p>
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor="targetYear" className={labelClassName}>
                Ciljana godina (neobavezno)
              </Label>
              <Select
                value={
                  targetYear !== undefined && targetYear !== null
                    ? String(targetYear)
                    : "all"
                }
                onValueChange={(value) =>
                  setValue(
                    "targetYear",
                    value === "all" ? undefined : Number.parseInt(value, 10),
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="targetYear" className={selectTriggerClassName}>
                  <SelectValue placeholder="Sve godine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve godine</SelectItem>
                  {[1, 2, 3, 4, 5].map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}. godina
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetYear && (
                <p className="text-sm text-rose-600">{errors.targetYear.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pitanja</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dodajte i postavite pitanja na koja će studenti odgovarati.
            </p>
          </div>
          <button
            type="button"
            onClick={() => appendQuestion(createDefaultQuestion(questionFields.length))}
            className={secondaryButtonClassName}
          >
            <Plus className="h-4 w-4" />
            Dodaj pitanje
          </button>
        </div>

        <div className="space-y-4">
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
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/dashboard" className={secondaryButtonClassName}>
          Odustani
        </Link>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
          {isSubmitting ? "Kreiranje ankete..." : "Izradi anketu"}
        </button>
      </div>
    </form>
  );
}
