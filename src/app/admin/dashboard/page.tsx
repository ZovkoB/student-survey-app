import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { getAdminSurveys } from "@/app/actions/surveys";
import { auth } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { SurveyTable } from "./survey-table";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const result = await getAdminSurveys();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Survey Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage surveys, monitor status, and review collected responses.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/surveys/create">
            <Plus className="h-4 w-4" />
            Create Survey
          </Link>
        </Button>
      </div>

      {!result.success && (
        <Alert variant="destructive">
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {result.success && result.data && <SurveyTable surveys={result.data} />}
    </div>
  );
}
