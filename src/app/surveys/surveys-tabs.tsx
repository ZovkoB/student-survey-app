"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList } from "lucide-react";

import type {
  AvailableSurveyListItem,
  CompletedSurveyListItem,
} from "@/app/actions/student-surveys";
import {
  formatDate,
  formatQuestionCount,
  formatYearLabel,
} from "@/lib/i18n/hr";

type Tab = "active" | "completed";

function MetadataTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function SurveyMetadataTags({
  subject,
  targetProgram,
  targetYear,
  questionCount,
  dateLabel,
  dateValue,
}: {
  subject: string | null;
  targetProgram: string | null;
  targetYear: number | null;
  questionCount: number;
  dateLabel?: string;
  dateValue?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {subject && <MetadataTag>Predmet: {subject}</MetadataTag>}
      {targetProgram && <MetadataTag>Smjer: {targetProgram}</MetadataTag>}
      {targetYear && <MetadataTag>{formatYearLabel(targetYear)}</MetadataTag>}
      {!targetProgram && !targetYear && (
        <MetadataTag>Otvoreno za sve smjerove</MetadataTag>
      )}
      <MetadataTag>{formatQuestionCount(questionCount)}</MetadataTag>
      {dateValue && dateLabel && (
        <MetadataTag>
          {dateLabel} {formatDate(dateValue)}
        </MetadataTag>
      )}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
      <ClipboardList className="mx-auto mb-4 h-10 w-10 text-slate-400" />
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
    </div>
  );
}

export function SurveysTabs({
  availableSurveys,
  completedSurveys,
}: {
  availableSurveys: AvailableSurveyListItem[];
  completedSurveys: CompletedSurveyListItem[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("active");

  const tabClass = (tab: Tab) =>
    tab === activeTab
      ? "border-b-2 border-[#5c4eb4] pb-2 text-[#5c4eb4] font-semibold"
      : "pb-2 text-slate-500 font-medium hover:text-slate-800";

  return (
    <>
      <nav className="mb-8 border-b border-slate-200">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`text-sm transition-colors ${tabClass("active")}`}
          >
            Aktivne ankete
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`text-sm transition-colors ${tabClass("completed")}`}
          >
            Završene ankete
          </button>
        </div>
      </nav>

      {activeTab === "active" &&
        (availableSurveys.length === 0 ? (
          <EmptyState
            title="Trenutno nema dostupnih anketa"
            description="Provjerite kasnije za nove ankete ili pregledajte završene ankete u drugom tabu."
          />
        ) : (
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {availableSurveys.map((survey) => (
              <article
                key={survey.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{survey.title}</h2>
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Dostupno
                    </span>
                  </div>
                  <p className="my-2 flex-grow text-sm text-slate-600">
                    {survey.description}
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <SurveyMetadataTags
                    subject={survey.subject}
                    targetProgram={survey.targetProgram}
                    targetYear={survey.targetYear}
                    questionCount={survey.questionCount}
                    dateLabel="Objavljeno"
                    dateValue={survey.createdAt}
                  />
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#5c4eb4] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4] md:w-auto"
                  >
                    Započni anketu
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ))}

      {activeTab === "completed" &&
        (completedSurveys.length === 0 ? (
          <EmptyState
            title="Nemate završenih anketa"
            description="Ankete koje ispunite pojavit će se ovdje nakon slanja odgovora."
          />
        ) : (
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {completedSurveys.map((survey) => (
              <article
                key={survey.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{survey.title}</h2>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      Ispunjeno
                    </span>
                  </div>
                  <p className="my-2 flex-grow text-sm text-slate-600">
                    {survey.description}
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <SurveyMetadataTags
                    subject={survey.subject}
                    targetProgram={survey.targetProgram}
                    targetYear={survey.targetYear}
                    questionCount={survey.questionCount}
                    dateLabel="Poslano"
                    dateValue={survey.submittedAt}
                  />
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-5 py-2.5 text-center text-sm font-semibold text-slate-400 md:w-auto"
                  >
                    Anketa ispunjena
                  </button>
                </div>
              </article>
            ))}
          </div>
        ))}
    </>
  );
}
