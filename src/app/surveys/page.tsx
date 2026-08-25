import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";

import {
  getAvailableSurveys,
  getCompletedSurveys,
} from "@/app/actions/student-surveys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function SurveyMetadata({
  subject,
  targetProgram,
  targetYear,
  questionCount,
}: {
  subject: string | null;
  targetProgram: string | null;
  targetYear: number | null;
  questionCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      {subject && <span>Subject: {subject}</span>}
      {targetProgram && <span>Program: {targetProgram}</span>}
      {targetYear && <span>Year: {targetYear}</span>}
      {!targetProgram && !targetYear && (
        <span>Open to all programs and years</span>
      )}
      <span>{questionCount} question{questionCount === 1 ? "" : "s"}</span>
    </div>
  );
}

export default async function StudentSurveysPage() {
  const [availableResult, completedResult] = await Promise.all([
    getAvailableSurveys(),
    getCompletedSurveys(),
  ]);

  const availableSurveys = availableResult.data ?? [];
  const completedSurveys = completedResult.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Surveys</h1>
        <p className="mt-1 text-muted-foreground">
          Complete surveys matched to your study program and year.
        </p>
      </div>

      {(!availableResult.success || !completedResult.success) && (
        <Alert variant="destructive">
          <AlertDescription>
            {availableResult.message || completedResult.message}
          </AlertDescription>
        </Alert>
      )}

      {availableSurveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-medium">No surveys available right now</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Check back later for new surveys, or review your completed
              submissions below.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {availableSurveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{survey.title}</CardTitle>
                    <CardDescription>{survey.description}</CardDescription>
                  </div>
                  <Badge variant="success">Available</Badge>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <SurveyMetadata
                  subject={survey.subject}
                  targetProgram={survey.targetProgram}
                  targetYear={survey.targetYear}
                  questionCount={survey.questionCount}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Posted {formatDate(survey.createdAt)}
                  </span>
                  <Button asChild>
                    <Link href={`/surveys/${survey.id}`}>Start survey</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {completedSurveys.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Completed Surveys
            </h2>
            <p className="text-sm text-muted-foreground">
              Surveys you have already submitted.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {completedSurveys.map((survey) => (
              <Card key={survey.id} className="border-dashed">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <CardDescription>{survey.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SurveyMetadata
                    subject={survey.subject}
                    targetProgram={survey.targetProgram}
                    targetYear={survey.targetYear}
                    questionCount={survey.questionCount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(survey.submittedAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
