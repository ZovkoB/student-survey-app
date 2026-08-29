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

const selectTriggerClassName =
  "rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-[#5c4eb4] focus:bg-white focus:ring-2 focus:ring-[#5c4eb4]/10 focus:ring-offset-0";

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
    <div className="mb-6 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Filter className="h-4 w-4 text-slate-500" />
        Filteri segmenta
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="analytics-program-filter" className="text-sm text-slate-700">
            Studijski smjer
          </Label>
          <Select
            value={getAnalyticsProgramParam(program)}
            onValueChange={(value) => updateFilter("program", value)}
          >
            <SelectTrigger id="analytics-program-filter" className={selectTriggerClassName}>
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
          <Label htmlFor="analytics-year-filter" className="text-sm text-slate-700">
            Godina studija
          </Label>
          <Select
            value={getAnalyticsYearParam(year)}
            onValueChange={(value) => updateFilter("year", value)}
          >
            <SelectTrigger id="analytics-year-filter" className={selectTriggerClassName}>
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
