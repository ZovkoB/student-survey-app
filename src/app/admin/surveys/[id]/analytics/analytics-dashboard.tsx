import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, Star, Users, GraduationCap } from "lucide-react";

import type { SurveyAnalyticsData } from "@/app/actions/analytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRating } from "@/lib/analytics/constants";
import { formatResponseCount } from "@/lib/i18n/hr";

import {
  ChoiceQuestionChart,
  DemographicBarChart,
  DemographicPieChart,
  RatingQuestionChart,
  TextQuestionList,
} from "./analytics-charts";
import { ExportCsvButton } from "./export-csv-button";
import { AnalyticsSegmentFiltersBar } from "./analytics-segment-filters-bar";

type AnalyticsDashboardProps = {
  data: SurveyAnalyticsData;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
            <Link href="/admin/dashboard">
              <ChevronLeft className="h-4 w-4" />
              Natrag na nadzornu ploču
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {data.survey.title}
              </h1>
              <Badge variant={data.survey.isActive ? "success" : "muted"}>
                {data.survey.isActive ? "Aktivno" : "Neaktivno"}
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-muted-foreground">
              {data.survey.description}
            </p>
            {data.survey.subject && (
              <p className="mt-1 text-sm text-muted-foreground">
                Predmet: {data.survey.subject}
              </p>
            )}
          </div>
        </div>
        <ExportCsvButton surveyId={data.survey.id} />
      </div>

      <AnalyticsSegmentFiltersBar
        program={data.segment.program}
        year={data.segment.year}
      />

      {data.segment.isActive && (
        <Alert>
          <AlertDescription>
            Prikaz filtriranog segmenta
            {data.segment.label ? `: ${data.segment.label}` : ""} —{" "}
            {data.summary.totalResponses} od{" "}
            {data.segment.totalResponsesInSurvey}{" "}
            {data.segment.totalResponsesInSurvey === 1
              ? "ukupnog odgovora"
              : "ukupnih odgovora"}
            .
          </AlertDescription>
        </Alert>
      )}

      {data.segment.isActive && data.summary.totalResponses === 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Nema odgovora koji odgovaraju odabranim filterima. Pokušajte
            proširiti odabir smjera ili godine.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupno odgovora</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalResponses}</div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prosječna ocjena</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.summary.averageRating !== null
                ? formatRating(data.summary.averageRating)
                : "N/P"}
            </div>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vodeći smjer</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.topProgram?.label ?? "N/P"}
            </div>
            {data.summary.topProgram && (
              <p className="text-sm text-muted-foreground">
                {formatResponseCount(data.summary.topProgram.count)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Demografska struktura
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.segment.isActive
              ? "Raspodjela unutar odabranog segmenta."
              : "Kako su ispitanici raspoređeni po smjeru i godini studija."}
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <DemographicBarChart
            title="Odgovori po smjeru"
            description="Broj predanih anketa po studijskom smjeru"
            data={data.demographics.programs}
          />
          <DemographicPieChart
            title="Odgovori po godini"
            description="Udio predanih anketa po godinama studija"
            data={data.demographics.years}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Analiza po pitanjima
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.segment.isActive
              ? "Analitika pitanja za odabrani segment."
              : "Detaljna analitika za svako pitanje u anketi."}
          </p>
        </div>
        <div className="space-y-6">
          {data.questions.map((question) => {
            if (
              question.type === QuestionType.SINGLE_CHOICE ||
              question.type === QuestionType.MULTIPLE_CHOICE
            ) {
              return (
                <ChoiceQuestionChart key={question.id} question={question} />
              );
            }

            if (question.type === QuestionType.RATING_1_5) {
              return (
                <RatingQuestionChart key={question.id} question={question} />
              );
            }

            return <TextQuestionList key={question.id} question={question} />;
          })}
        </div>
      </section>
    </div>
  );
}
