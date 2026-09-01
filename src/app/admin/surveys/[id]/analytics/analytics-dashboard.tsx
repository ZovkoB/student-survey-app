import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, GraduationCap, Star, Users } from "lucide-react";

import type { SurveyAnalyticsData } from "@/app/actions/analytics";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

function KpiCard({
  title,
  icon: Icon,
  value,
  subtext,
}: {
  title: string;
  icon: typeof Users;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span>{title}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
        {subtext && (
          <p className="mt-1 text-xs font-medium text-slate-500">{subtext}</p>
        )}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="w-full min-w-0 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/admin/dashboard"
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Natrag na nadzornu ploču
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{data.survey.title}</h1>
            {data.survey.isActive ? (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Aktivno
              </span>
            ) : (
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                Neaktivno
              </span>
            )}
          </div>
          <p className="mt-1 max-w-3xl text-sm font-normal text-slate-600">
            {data.survey.description}
          </p>
          {data.survey.subject && (
            <p className="mt-1 text-sm font-normal text-slate-600">
              Predmet: {data.survey.subject}
            </p>
          )}
        </div>
        <ExportCsvButton
          surveyId={data.survey.id}
          program={data.segment.program}
          year={data.segment.year}
        />
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
            {data.summary.totalResponses} od {data.segment.totalResponsesInSurvey}{" "}
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
            Nema odgovora koji odgovaraju odabranim filterima. Pokušajte proširiti
            odabir smjera ili godine.
          </AlertDescription>
        </Alert>
      )}

      <div className="app-grid-3">
        <KpiCard
          title="Ukupno odgovora"
          icon={Users}
          value={String(data.summary.totalResponses)}
          subtext={formatResponseCount(data.summary.totalResponses)}
        />
        <KpiCard
          title="Prosječna ocjena"
          icon={Star}
          value={
            data.summary.averageRating !== null
              ? formatRating(data.summary.averageRating)
              : "N/P"
          }
        />
        <KpiCard
          title="Vodeći smjer"
          icon={GraduationCap}
          value={data.summary.topProgram?.label ?? "N/P"}
          subtext={
            data.summary.topProgram
              ? formatResponseCount(data.summary.topProgram.count)
              : undefined
          }
        />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="mb-1 text-xl font-bold text-slate-900">
            Demografska struktura
          </h2>
          <p className="text-sm text-slate-600">
            {data.segment.isActive
              ? "Raspodjela unutar odabranog segmenta."
              : "Kako su ispitanici raspoređeni po smjeru i godini studija."}
          </p>
        </div>
        <div className="app-grid-2">
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
          <h2 className="mb-1 text-xl font-bold text-slate-900">Analiza po pitanjima</h2>
          <p className="text-sm text-slate-600">
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
