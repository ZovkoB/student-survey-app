"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { BarChart3, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteSurvey,
  toggleSurveyStatus,
  type AdminSurveyListItem,
} from "@/app/actions/surveys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatYearLabel } from "@/lib/i18n/hr";

type SurveyTableProps = {
  surveys: AdminSurveyListItem[];
};

export function SurveyTable({ surveys }: SurveyTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleStatus(survey: AdminSurveyListItem) {
    startTransition(async () => {
      const result = await toggleSurveyStatus(survey.id);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  function handleDelete(survey: AdminSurveyListItem) {
    const confirmed = window.confirm(
      `Obrisati anketu „${survey.title}"? Time će se trajno ukloniti sva pitanja, opcije i odgovori.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteSurvey(survey.id);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  if (surveys.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background p-10 text-center shadow-sm">
        <h3 className="text-lg font-medium">Još nema anketa</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Izradite prvu anketu kako biste počeli prikupljati studentske povratne
          informacije.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/surveys/create">Izradi anketu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Anketa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pitanja</TableHead>
            <TableHead>Odgovori</TableHead>
            <TableHead>Kreirano</TableHead>
            <TableHead className="text-right">Radnje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id} className="transition-colors hover:bg-muted/40">
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{survey.title}</p>
                  <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
                    {survey.description}
                  </p>
                  {(survey.subject || survey.targetProgram || survey.targetYear) && (
                    <p className="text-xs text-muted-foreground">
                      {[
                        survey.subject,
                        survey.targetProgram,
                        survey.targetYear && formatYearLabel(survey.targetYear),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={survey.isActive ? "success" : "muted"}>
                  {survey.isActive ? "Aktivno" : "Neaktivno"}
                </Badge>
              </TableCell>
              <TableCell>{survey.questionCount}</TableCell>
              <TableCell>{survey.responseCount}</TableCell>
              <TableCell>{formatDateTime(survey.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/surveys/${survey.id}/analytics`}>
                      <BarChart3 className="h-4 w-4" />
                      Analitika
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleStatus(survey)}
                  >
                    <Power className="h-4 w-4" />
                    {survey.isActive ? "Deaktiviraj" : "Aktiviraj"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(survey)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Obriši
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
