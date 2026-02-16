function normalizeValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeValue(item));
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
        return Object.fromEntries(entries.map(([key, nestedValue]) => [key, normalizeValue(nestedValue)]));
    }
    return value;
}
export function stableStringify(obj) {
    return JSON.stringify(normalizeValue(obj));
}
//# sourceMappingURL=normalize.js.map