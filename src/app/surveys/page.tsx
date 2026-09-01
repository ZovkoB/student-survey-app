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
    <>
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-slate-900 md:text-3xl">Dostupne ankete</h1>
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
    </>
  );
}
