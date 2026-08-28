"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending}
      className="shadow-sm"
    >
      <Download className="h-4 w-4" />
      {isPending ? "Izvoz..." : "Izvezi u CSV"}
    </Button>
  );
}
