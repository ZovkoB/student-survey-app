import {
  getAvailableSurveys,
  getCompletedSurveys,
} from "@/app/actions/student-surveys";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { SurveysTabs } from "./surveys-tabs";

export default async function StudentSurveysPage() {
  const [availableResult, completedResult] = await Promise.all([
    getAvailableSurveys(),
    getCompletedSurveys(),
  ]);

  const availableSurveys = availableResult.data ?? [];
  const completedSurveys = completedResult.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold text-slate-900">Dostupne ankete</h1>
        <p className="text-base text-slate-600">
          Ispunite ankete prilagođene vašem studijskom smjeru i godini.
        </p>
      </div>

      {(!availableResult.success || !completedResult.success) && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {availableResult.message || completedResult.message}
          </AlertDescription>
        </Alert>
      )}

      <SurveysTabs
        availableSurveys={availableSurveys}
        completedSurveys={completedSurveys}
      />
    </div>
  );
}
