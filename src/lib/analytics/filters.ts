import { normalizeStudyProgram } from "@/lib/study-program";

export const ANALYTICS_PROGRAM_OPTIONS = [
  { value: "all", label: "All Programs" },
  { value: "Računarstvo", label: "Računarstvo" },
  { value: "Strojarstvo", label: "Strojarstvo" },
  { value: "Elektrotehnika", label: "Elektrotehnika" },
] as const;

export const ANALYTICS_YEAR_OPTIONS = [
  { value: "all", label: "All Years" },
  { value: "1", label: "Year 1" },
  { value: "2", label: "Year 2" },
  { value: "3", label: "Year 3" },
  { value: "4", label: "Year 4" },
  { value: "5", label: "Year 5" },
] as const;

export type AnalyticsSegmentFilters = {
  program: string | null;
  year: number | null;
};

export type AnalyticsSearchParams = {
  program?: string;
  year?: string;
};

export function parseAnalyticsFilters(
  searchParams: AnalyticsSearchParams,
): AnalyticsSegmentFilters {
  const rawProgram = searchParams.program?.trim();
  const program =
    rawProgram && rawProgram !== "all"
      ? normalizeStudyProgram(rawProgram)
      : null;

  const rawYear = searchParams.year?.trim();
  const parsedYear =
    rawYear && rawYear !== "all" ? Number.parseInt(rawYear, 10) : null;
  const year =
    parsedYear !== null && !Number.isNaN(parsedYear) && parsedYear >= 1 && parsedYear <= 5
      ? parsedYear
      : null;

  return { program, year };
}

export function isAnalyticsSegmentActive(filters: AnalyticsSegmentFilters) {
  return filters.program !== null || filters.year !== null;
}

export function getAnalyticsProgramParam(program: string | null) {
  return program ?? "all";
}

export function getAnalyticsYearParam(year: number | null) {
  return year !== null ? String(year) : "all";
}

export function formatAnalyticsSegmentLabel(filters: AnalyticsSegmentFilters) {
  const parts: string[] = [];

  if (filters.program) {
    parts.push(filters.program);
  }

  if (filters.year !== null) {
    parts.push(`Year ${filters.year}`);
  }

  return parts.join(" · ");
}
