import { Suspense } from "react";

import type { AnalyticsSearchParams } from "@/lib/analytics/filters";

import { AnalyticsContent } from "./analytics-content";
import AnalyticsLoading from "./loading";

export default async function SurveyAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<AnalyticsSearchParams>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent surveyId={id} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
