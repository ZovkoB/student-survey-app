"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { exportSurveyDataCsv } from "@/app/actions/analytics";
import { Button } from "@/components/ui/button";

type ExportCsvButtonProps = {
  surveyId: string;
};

export function ExportCsvButton({ surveyId }: ExportCsvButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportSurveyDataCsv(surveyId);

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      const blob = new Blob([result.data.csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV export downloaded successfully.");
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isPending}
    >
      <Download className="h-4 w-4" />
      {isPending ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
