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
      <Label>Opcije odgovora</Label>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-start gap-2">
          <Input
            {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
            placeholder={`Opcija ${optionIndex + 1}`}
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
        Dodaj opciju
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
            Pitanje {questionIndex + 1}
          </CardTitle>
          <CardDescription>
            Postavite tekst pitanja, vrstu i opcije odgovora.
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
          Ukloni
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${questionIndex}`}>Tekst pitanja</Label>
          <Input
            id={`question-text-${questionIndex}`}
            {...register(`questions.${questionIndex}.text`)}
            placeholder="Unesite pitanje"
          />
          {errors.questions?.[questionIndex]?.text && (
            <p className="text-sm text-destructive">
              {errors.questions[questionIndex]?.text?.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Vrsta pitanja</Label>
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
          <p className="text-sm text-muted-foreground">
            Studenti će ocijeniti ovo pitanje na ljestvici od 1 do 5.
          </p>
        )}

        {questionType === QuestionType.TEXT && (
          <p className="text-sm text-muted-foreground">
            Studenti će dati slobodan tekstualni odgovor na ovo pitanje.
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
          <CardTitle>Detalji ankete</CardTitle>
          <CardDescription>
            Osnovne informacije i pravila ciljanja za ovu anketu.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov</Label>
            <Input id="title" {...register("title")} placeholder="Anketa o kvaliteti nastave" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Opišite svrhu ove ankete"
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
              <Label htmlFor="subject">Predmet (neobavezno)</Label>
              <Input id="subject" {...register("subject")} placeholder="Matematika" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetProgram">Ciljani smjer (neobavezno)</Label>
              <Input
                id="targetProgram"
                {...register("targetProgram")}
                placeholder="Računarstvo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetYear">Ciljana godina (neobavezno)</Label>
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
            <h2 className="text-xl font-semibold">Pitanja</h2>
            <p className="text-sm text-muted-foreground">
              Dodajte i postavite pitanja na koja će studenti odgovarati.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => appendQuestion(createDefaultQuestion(questionFields.length))}
          >
            <Plus className="h-4 w-4" />
            Dodaj pitanje
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
          <Link href="/admin/dashboard">Odustani</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kreiranje ankete..." : "Izradi anketu"}
        </Button>
      </div>
    </form>
  );
}
