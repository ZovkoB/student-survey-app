import { notFound } from "next/navigation";

import { getSurveyAnalytics } from "@/app/actions/analytics";

import { AnalyticsDashboard } from "./analytics-dashboard";

type AnalyticsContentProps = {
  surveyId: string;
};

export async function AnalyticsContent({ surveyId }: AnalyticsContentProps) {
  const result = await getSurveyAnalytics(surveyId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <AnalyticsDashboard data={result.data} />;
}
