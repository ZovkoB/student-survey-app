import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { getAdminSurveys } from "@/app/actions/surveys";
import { auth } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { SurveyTable } from "./survey-table";
import { CreateAdminDialog } from "./create-admin-dialog";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const result = await getAdminSurveys();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-slate-900">Nadzorna ploča</h1>
          <p className="mb-6 text-base text-slate-600">
            Upravljajte anketama, pratite status i pregledajte prikupljene odgovore.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CreateAdminDialog />
          <Link
            href="/admin/surveys/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5c4eb4] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4]"
          >
            <Plus className="h-4 w-4" />
            Izradi anketu
          </Link>
        </div>
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
