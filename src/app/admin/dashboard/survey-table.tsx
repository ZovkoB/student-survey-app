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

type SurveyTableProps = {
  surveys: AdminSurveyListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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
      `Delete "${survey.title}"? This will permanently remove all questions, options, and responses.`,
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
      <div className="rounded-lg border border-dashed bg-background p-10 text-center">
        <h3 className="text-lg font-medium">No surveys yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first survey to start collecting student feedback.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/surveys/create">Create Survey</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Survey</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Responses</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{survey.title}</p>
                  <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
                    {survey.description}
                  </p>
                  {(survey.subject || survey.targetProgram || survey.targetYear) && (
                    <p className="text-xs text-muted-foreground">
                      {[survey.subject, survey.targetProgram, survey.targetYear && `Year ${survey.targetYear}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={survey.isActive ? "success" : "muted"}>
                  {survey.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{survey.questionCount}</TableCell>
              <TableCell>{survey.responseCount}</TableCell>
              <TableCell>{formatDate(survey.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/surveys/${survey.id}/analytics`}>
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleToggleStatus(survey)}
                  >
                    <Power className="h-4 w-4" />
                    {survey.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(survey)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
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
