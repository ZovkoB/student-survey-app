import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { SurveyBuilderForm } from "./survey-builder-form";

export default function CreateSurveyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Natrag na nadzornu ploču
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-slate-900 md:text-3xl">Izradi anketu</h1>
        <p className="text-base text-slate-600">
          Izradite novu anketu s dinamičkim pitanjima i opcijama odgovora.
        </p>
      </div>

      <SurveyBuilderForm />
    </div>
  );
}
