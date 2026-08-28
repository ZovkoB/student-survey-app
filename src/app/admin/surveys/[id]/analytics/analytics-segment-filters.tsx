"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANALYTICS_PROGRAM_OPTIONS,
  ANALYTICS_YEAR_OPTIONS,
  getAnalyticsProgramParam,
  getAnalyticsYearParam,
} from "@/lib/analytics/filters";

type AnalyticsSegmentFiltersProps = {
  program: string | null;
  year: number | null;
};

export function AnalyticsSegmentFilters({
  program,
  year,
}: AnalyticsSegmentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: "program" | "year", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4 text-muted-foreground" />
        Filteri segmenta
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="analytics-program-filter">Studijski smjer</Label>
          <Select
            value={getAnalyticsProgramParam(program)}
            onValueChange={(value) => updateFilter("program", value)}
          >
            <SelectTrigger id="analytics-program-filter">
              <SelectValue placeholder="Svi smjerovi" />
            </SelectTrigger>
            <SelectContent>
              {ANALYTICS_PROGRAM_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="analytics-year-filter">Godina studija</Label>
          <Select
            value={getAnalyticsYearParam(year)}
            onValueChange={(value) => updateFilter("year", value)}
          >
            <SelectTrigger id="analytics-year-filter">
              <SelectValue placeholder="Sve godine" />
            </SelectTrigger>
            <SelectContent>
              {ANALYTICS_YEAR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
