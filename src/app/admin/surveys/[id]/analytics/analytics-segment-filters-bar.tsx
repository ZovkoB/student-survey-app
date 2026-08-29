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
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm text-slate-500 shadow-sm">
          Učitavanje filtera...
        </div>
      }
    >
      <AnalyticsSegmentFilters program={program} year={year} />
    </Suspense>
  );
}
