import { NextResponse } from "next/server";

import { exportSurveyDataCsv } from "@/app/actions/analytics";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const filters = parseAnalyticsFilters({
    program: searchParams.get("program") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  });
  const result = await exportSurveyDataCsv(id, filters);

  if (!result.success || !result.data) {
    return NextResponse.json({ error: result.message }, { status: 404 });
  }

  const { csvBuffer, contentDisposition, contentType } = result.data;

  return new NextResponse(csvBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
      "Cache-Control": "no-store",
    },
  });
}
