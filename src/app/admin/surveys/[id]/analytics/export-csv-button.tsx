"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

type ExportCsvButtonProps = {
  surveyId: string;
};

const CSV_CONTENT_TYPE = "text/csv; charset=utf-8";

function parseContentDispositionFilename(
  contentDisposition: string | null,
): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8FilenameMatch?.[1]) {
    return decodeURIComponent(utf8FilenameMatch[1]);
  }

  const asciiFilenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
  return asciiFilenameMatch?.[1] ?? null;
}

export function ExportCsvButton({ surveyId }: ExportCsvButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/surveys/${surveyId}/export-csv`,
        );

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          toast.error(errorBody?.error ?? "Izvoz u CSV nije uspio.");
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const contentType =
          response.headers.get("Content-Type") ?? CSV_CONTENT_TYPE;
        const filename =
          parseContentDispositionFilename(
            response.headers.get("Content-Disposition"),
          ) ?? "odgovori-ankete.csv";

        const blob = new Blob([arrayBuffer], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("CSV izvoz je uspješno preuzet.");
      } catch {
        toast.error("Izvoz u CSV nije uspio.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-xl bg-[#5c4eb4] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download className="h-4 w-4" />
      {isPending ? "Izvoz..." : "Izvezi u CSV"}
    </button>
  );
}
