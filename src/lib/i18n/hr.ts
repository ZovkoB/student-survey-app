const DATE_LOCALE = "hr-HR";

export function formatYearLabel(year: number): string {
  return `${year}. godina`;
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    dateStyle: "medium",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatResponseCount(count: number): string {
  return count === 1 ? "1 odgovor" : `${count} odgovora`;
}

export function formatQuestionCount(count: number): string {
  return count === 1 ? "1 pitanje" : `${count} pitanja`;
}

export function formatAnswerCount(count: number): string {
  return count === 1 ? "1 odgovor" : `${count} odgovora`;
}
