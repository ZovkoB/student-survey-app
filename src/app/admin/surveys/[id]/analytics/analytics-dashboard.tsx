import { QuestionType } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, Star, Users, GraduationCap } from "lucide-react";

import type { SurveyAnalyticsData } from "@/app/actions/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRating } from "@/lib/analytics/constants";

import {
  ChoiceQuestionChart,
  DemographicBarChart,
  DemographicPieChart,
  RatingQuestionChart,
  TextQuestionList,
} from "./analytics-charts";
import { ExportCsvButton } from "./export-csv-button";

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
              Back to dashboard
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {data.survey.title}
              </h1>
              <Badge variant={data.survey.isActive ? "success" : "muted"}>
                {data.survey.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-1 max-w-3xl text-muted-foreground">
              {data.survey.description}
            </p>
            {data.survey.subject && (
              <p className="mt-1 text-sm text-muted-foreground">
                Subject: {data.survey.subject}
              </p>
            )}
          </div>
        </div>
        <ExportCsvButton surveyId={data.survey.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalResponses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.summary.averageRating !== null
                ? formatRating(data.summary.averageRating)
                : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Program</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.topProgram?.label ?? "N/A"}
            </div>
            {data.summary.topProgram && (
              <p className="text-sm text-muted-foreground">
                {data.summary.topProgram.count} response
                {data.summary.topProgram.count === 1 ? "" : "s"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Demographic Breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            How respondents are distributed by program and year of study.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <DemographicBarChart
            title="Responses by Program"
            description="Number of submissions from each study program"
            data={data.demographics.programs}
          />
          <DemographicPieChart
            title="Responses by Year"
            description="Share of submissions across study years"
            data={data.demographics.years}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Question Breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            Detailed analytics for each survey question.
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
