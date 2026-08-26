const STUDY_PROGRAM_ALIASES: Record<string, string> = {
  racunarstvo: "Računarstvo",
  strojarstvo: "Strojarstvo",
  elektrotehnika: "Elektrotehnika",
};

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toLookupKey(value: string) {
  return stripDiacritics(value.trim().toLowerCase());
}

export function normalizeStudyProgram(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return STUDY_PROGRAM_ALIASES[toLookupKey(trimmed)] ?? trimmed;
}

export function getStudyProgramMatchValues(
  value: string | null | undefined,
): string[] {
  const normalized = normalizeStudyProgram(value);

  if (!normalized) {
    return [];
  }

  const matchValues = new Set<string>([normalized]);

  if (normalized === "Računarstvo") {
    matchValues.add("Racunarstvo");
  }

  const trimmedOriginal = value?.trim();
  if (trimmedOriginal && trimmedOriginal !== normalized) {
    matchValues.add(trimmedOriginal);
  }

  return Array.from(matchValues);
}

export const UTF8_BOM = "\uFEFF";
