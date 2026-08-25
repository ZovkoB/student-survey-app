import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SurveyBuilderForm } from "./survey-builder-form";

export default function CreateSurveyPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
          <Link href="/admin/dashboard">
            <ChevronLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Survey</h1>
          <p className="mt-1 text-muted-foreground">
            Build a new survey with dynamic questions and answer options.
          </p>
        </div>
      </div>

      <SurveyBuilderForm />
    </div>
  );
}
