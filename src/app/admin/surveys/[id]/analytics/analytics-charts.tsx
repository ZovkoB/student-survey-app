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
import { ANALYTICS_COLORS, formatPercentage } from "@/lib/analytics/constants";
import { formatDateTime, formatYearLabel } from "@/lib/i18n/hr";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="rounded-md border bg-background p-3 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        Broj: {item?.count ?? payload[0]?.value}
      </p>
      {item?.percentage !== undefined && (
        <p className="text-muted-foreground">
          Udio: {formatPercentage(item.percentage)}
        </p>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Još nema podataka.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
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
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{question.text}</CardTitle>
          <Badge variant="secondary">
            {question.type === "SINGLE_CHOICE" ? "Jedan izbor" : "Više izbora"}
          </Badge>
        </div>
        <CardDescription>
          {question.totalAnswers}{" "}
          {question.totalAnswers === 1 ? "odgovor" : "odgovora"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
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
                <span>{option.label}</span>
                <span className="text-muted-foreground">
                  {option.count} ({formatPercentage(option.percentage)})
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
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
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{question.text}</CardTitle>
          <Badge variant="secondary">Ocjena 1–5</Badge>
        </div>
        <CardDescription>
          Prosjek {question.average.toFixed(2)} · Medijan {question.median.toFixed(1)} ·{" "}
          {question.totalAnswers}{" "}
          {question.totalAnswers === 1 ? "odgovor" : "odgovora"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
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
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Prosjek</p>
            <p className="text-2xl font-semibold">{question.average.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Medijan</p>
            <p className="text-2xl font-semibold">{question.median.toFixed(1)}</p>
          </div>
          {question.distribution.map((item, index) => (
            <div key={item.rating} className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                {item.rating} {item.rating === 1 ? "zvjezdica" : "zvjezdice"}
              </p>
              <p className="text-xl font-semibold">{item.count}</p>
              <p
                className="text-xs"
                style={{ color: ANALYTICS_COLORS[index % ANALYTICS_COLORS.length] }}
              >
                {formatPercentage(item.percentage)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TextQuestionList({
  question,
}: {
  question: TextQuestionAnalytics;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{question.text}</CardTitle>
          <Badge variant="secondary">Tekstualni odgovor</Badge>
        </div>
        <CardDescription>
          Prikazano {question.recentResponses.length} od {question.totalAnswers}{" "}
          {question.totalAnswers === 1 ? "odgovora" : "odgovora"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.recentResponses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Još nema tekstualnih odgovora.</p>
        ) : (
          question.recentResponses.map((response, index) => (
            <div key={`${response.submittedAt}-${index}`} className="rounded-lg border p-4">
              <p className="text-sm leading-relaxed">{response.text}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {response.studentProgram} · {formatYearLabel(response.studentYear)} ·{" "}
                {formatDateTime(response.submittedAt)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
