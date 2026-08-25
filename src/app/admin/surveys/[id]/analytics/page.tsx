import { Suspense } from "react";

import { AnalyticsContent } from "./analytics-content";
import AnalyticsLoading from "./loading";

export default async function SurveyAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent surveyId={id} />
    </Suspense>
  );
}
