import { Suspense } from "react";

import { AnalyticsSegmentFilters } from "./analytics-segment-filters";

type AnalyticsSegmentFiltersBarProps = {
  program: string | null;
  year: number | null;
};

export function AnalyticsSegmentFiltersBar({
  program,
  year,
}: AnalyticsSegmentFiltersBarProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
          Učitavanje filtera...
        </div>
      }
    >
      <AnalyticsSegmentFilters program={program} year={year} />
    </Suspense>
  );
}
