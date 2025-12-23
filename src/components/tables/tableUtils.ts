const monthYearFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "numeric",
});

export function parseDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value);
}

export function formatMonthYear(value: Date | string | number) {
  return monthYearFormatter.format(parseDate(value));
}

export function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

export function compareValues(a: string | number | null, b: string | number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return a.toString().localeCompare(b.toString(), "es-ES");
}
