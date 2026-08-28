import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getSurveyById } from "@/app/actions/student-surveys";
import { auth } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { SurveyFillerForm } from "./survey-filler-form";

export default async function SurveyFillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/surveys/${id}`);
  }

  if (session.user.role !== "STUDENT") {
    redirect("/admin/dashboard");
  }

  const result = await getSurveyById(id);

  if (!result.success) {
    if (result.message.includes("Već ste ispunili")) {
      return (
        <div className="flex min-h-screen flex-col justify-between bg-[#f3f2f8 px-4 py-8">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <Link
              href="/surveys"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Natrag na ankete
            </Link>
            <Alert>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    notFound();
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f3f2f8 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link
          href="/surveys"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Natrag na ankete
        </Link>
        <SurveyFillerForm survey={result.data} />
      </div>
    </div>
  );
}
