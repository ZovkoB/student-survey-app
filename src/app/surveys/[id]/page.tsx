import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getSurveyById } from "@/app/actions/student-surveys";
import { auth } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    if (result.message.includes("already completed")) {
      return (
        <div className="space-y-6">
          <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
            <Link href="/surveys">
              <ChevronLeft className="h-4 w-4" />
              Back to surveys
            </Link>
          </Button>
          <Alert>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        </div>
      );
    }

    notFound();
  }

  if (!result.data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
        <Link href="/surveys">
          <ChevronLeft className="h-4 w-4" />
          Back to surveys
        </Link>
      </Button>
      <SurveyFillerForm survey={result.data} />
    </div>
  );
}
