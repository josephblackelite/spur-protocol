function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries.map(([key, nestedValue]) => [key, normalizeValue(nestedValue)]));
  }

  return value;
}

export function stableStringify(obj: unknown): string {
  return JSON.stringify(normalizeValue(obj));
}
