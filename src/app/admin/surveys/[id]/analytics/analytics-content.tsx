import { notFound } from "next/navigation";

import { getSurveyAnalytics } from "@/app/actions/analytics";
import {
  parseAnalyticsFilters,
  type AnalyticsSearchParams,
} from "@/lib/analytics/filters";

import { AnalyticsDashboard } from "./analytics-dashboard";

type AnalyticsContentProps = {
  surveyId: string;
  searchParams: AnalyticsSearchParams;
};

export async function AnalyticsContent({
  surveyId,
  searchParams,
}: AnalyticsContentProps) {
  const filters = parseAnalyticsFilters(searchParams);
  const result = await getSurveyAnalytics(surveyId, filters);

  if (!result.success || !result.data) {
    notFound();
  }

  return <AnalyticsDashboard data={result.data} />;
}
