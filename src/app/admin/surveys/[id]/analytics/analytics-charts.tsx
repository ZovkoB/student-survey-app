"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ChoiceQuestionAnalytics,
  DemographicBucket,
  RatingQuestionAnalytics,
  TextQuestionAnalytics,
} from "@/app/actions/analytics";
import {
  ANALYTICS_AXIS_FILL,
  ANALYTICS_COLORS,
  ANALYTICS_GRID_STROKE,
  formatPercentage,
} from "@/lib/analytics/constants";
import { formatDateTime, formatYearLabel } from "@/lib/i18n/hr";

const chartCardClassName =
  "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

const axisTick = { fontSize: 12, fill: ANALYTICS_AXIS_FILL };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { count?: number; percentage?: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-md">
      <p className="font-medium text-slate-900">{label}</p>
      <p className="text-slate-600">Broj: {item?.count ?? payload[0]?.value}</p>
      {item?.percentage !== undefined && (
        <p className="text-slate-600">Udio: {formatPercentage(item.percentage)}</p>
      )}
    </div>
  );
}

export function DemographicBarChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: DemographicBucket[];
}) {
  const chartData = data.map((item) => ({
    name: item.label,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className={chartCardClassName}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="h-72">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Još nema podataka.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ANALYTICS_GRID_STROKE} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function DemographicPieChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: DemographicBucket[];
}) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.count,
    count: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className={chartCardClassName}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="h-72">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Još nema podataka.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function ChoiceQuestionChart({
  question,
}: {
  question: ChoiceQuestionAnalytics;
}) {
  const chartData = question.options.map((option) => ({
    name: option.label,
    count: option.count,
    percentage: option.percentage,
  }));

  return (
    <div className={chartCardClassName}>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">{question.text}</h3>
          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {question.type === "SINGLE_CHOICE" ? "Jedan izbor" : "Više izbora"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {question.totalAnswers}{" "}
          {question.totalAnswers === 1 ? "odgovor" : "odgovora"}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={ANALYTICS_GRID_STROKE} />
              <XAxis type="number" allowDecimals={false} tick={axisTick} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={axisTick}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div key={option.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">{option.label}</span>
                <span className="text-slate-500">
                  {option.count} ({formatPercentage(option.percentage)})
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${option.percentage}%`,
                    backgroundColor:
                      ANALYTICS_COLORS[index % ANALYTICS_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RatingQuestionChart({
  question,
}: {
  question: RatingQuestionAnalytics;
}) {
  const chartData = question.distribution.map((item) => ({
    name: `${item.rating} ${item.rating === 1 ? "zvjezdica" : "zvjezdice"}`,
    count: item.count,
    percentage: item.percentage,
    rating: item.rating,
  }));

  return (
    <div className={chartCardClassName}>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">{question.text}</h3>
          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            Ocjena 1–5
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Prosjek {question.average.toFixed(2)} · Medijan {question.median.toFixed(1)} ·{" "}
          {question.totalAnswers}{" "}
          {question.totalAnswers === 1 ? "odgovor" : "odgovora"}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ANALYTICS_GRID_STROKE} />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.rating}
                    fill={ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Prosjek</p>
            <p className="text-2xl font-bold text-slate-900">
              {question.average.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Medijan</p>
            <p className="text-2xl font-bold text-slate-900">
              {question.median.toFixed(1)}
            </p>
          </div>
          {question.distribution.map((item, index) => (
            <div
              key={item.rating}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm text-slate-500">
                {item.rating} {item.rating === 1 ? "zvjezdica" : "zvjezdice"}
              </p>
              <p className="text-xl font-bold text-slate-900">{item.count}</p>
              <p
                className="text-xs font-medium"
                style={{ color: ANALYTICS_COLORS[index % ANALYTICS_COLORS.length] }}
              >
                {formatPercentage(item.percentage)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TextQuestionList({
  question,
}: {
  question: TextQuestionAnalytics;
}) {
  return (
    <div className={chartCardClassName}>
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900">{question.text}</h3>
          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            Tekstualni odgovor
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Prikazano {question.recentResponses.length} od {question.totalAnswers}{" "}
          {question.totalAnswers === 1 ? "odgovora" : "odgovora"}
        </p>
      </div>
      <div className="space-y-3">
        {question.recentResponses.length === 0 ? (
          <p className="text-sm text-slate-500">Još nema tekstualnih odgovora.</p>
        ) : (
          question.recentResponses.map((response, index) => (
            <div
              key={`${response.submittedAt}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm leading-relaxed text-slate-800">{response.text}</p>
              <p className="mt-3 text-xs text-slate-500">
                {response.studentProgram} · {formatYearLabel(response.studentYear)} ·{" "}
                {formatDateTime(response.submittedAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
