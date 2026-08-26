import { NextResponse } from "next/server";

import { exportSurveyDataCsv } from "@/app/actions/analytics";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await exportSurveyDataCsv(id);

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
