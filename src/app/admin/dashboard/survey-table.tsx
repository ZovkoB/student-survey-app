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

const analyticsButtonClassName =
  "flex items-center gap-1.5 rounded-lg border border-slate-200/60 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-200";

const toggleButtonClassName =
  "flex items-center gap-1.5 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100";

const deleteButtonClassName =
  "flex items-center gap-1.5 rounded-lg border border-rose-200/60 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60";

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
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Još nema anketa</h3>
        <p className="mt-2 text-sm text-slate-600">
          Izradite prvu anketu kako biste počeli prikupljati studentske povratne
          informacije.
        </p>
        <Link
          href="/admin/surveys/create"
          className="mt-6 inline-flex items-center rounded-xl bg-[#5c4eb4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4]"
        >
          Izradi anketu
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <Table>
        <TableHeader className="border-b border-slate-200 bg-slate-50">
          <TableRow className="border-b border-slate-200 hover:bg-slate-50">
            <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Anketa
            </TableHead>
            <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Pitanja
            </TableHead>
            <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Odgovori
            </TableHead>
            <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Kreirano
            </TableHead>
            <TableHead className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
              Radnje
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow
              key={survey.id}
              className="border-b border-slate-100 transition-colors hover:bg-slate-50/50"
            >
              <TableCell className="px-6 py-4">
                <div>
                  <p className="text-base font-bold text-slate-900">{survey.title}</p>
                  <p className="mt-0.5 line-clamp-2 max-w-md text-xs text-slate-500">
                    {survey.description}
                  </p>
                  {(survey.subject || survey.targetProgram || survey.targetYear) && (
                    <p className="mt-1 text-xs text-slate-500">
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
              <TableCell className="px-6 py-4">
                {survey.isActive ? (
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Aktivno
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    Neaktivno
                  </span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm font-medium text-slate-700">
                {survey.questionCount}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm font-medium text-slate-700">
                {survey.responseCount}
              </TableCell>
              <TableCell className="px-6 py-4 text-sm font-medium text-slate-700">
                {formatDateTime(survey.createdAt)}
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/admin/surveys/${survey.id}/analytics`}
                    className={analyticsButtonClassName}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Analitika
                  </Link>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleStatus(survey)}
                    className={toggleButtonClassName}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {survey.isActive ? "Deaktiviraj" : "Aktiviraj"}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(survey)}
                    className={deleteButtonClassName}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Obriši
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
