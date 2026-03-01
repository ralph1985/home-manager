export type GasBoilerInspectionStatus = "upToDate" | "dueSoon" | "overdue" | "unknown";

export type GasBoilerMandatoryInspection = {
  lastInspectionDate: Date | null;
  nextInspectionDate: Date | null;
  intervalYears: number;
  status: GasBoilerInspectionStatus;
  daysUntilDue: number | null;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_YEARS = 5;
const DUE_SOON_DAYS = 90;

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addYearsUtc(value: Date, years: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear() + years,
      value.getUTCMonth(),
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds()
    )
  );
}

export function calculateMandatoryGasInspection(
  lastInspectionDate?: Date | null,
  intervalYears?: number | null,
  now: Date = new Date()
): GasBoilerMandatoryInspection {
  const normalizedInterval =
    typeof intervalYears === "number" && Number.isInteger(intervalYears) && intervalYears > 0
      ? intervalYears
      : DEFAULT_INTERVAL_YEARS;

  if (!lastInspectionDate) {
    return {
      lastInspectionDate: null,
      nextInspectionDate: null,
      intervalYears: normalizedInterval,
      status: "unknown",
      daysUntilDue: null,
    };
  }

  const nextInspectionDate = addYearsUtc(lastInspectionDate, normalizedInterval);
  const diffDays = Math.ceil(
    (startOfUtcDay(nextInspectionDate).getTime() - startOfUtcDay(now).getTime()) / DAY_IN_MS
  );

  const status: GasBoilerInspectionStatus =
    diffDays < 0 ? "overdue" : diffDays <= DUE_SOON_DAYS ? "dueSoon" : "upToDate";

  return {
    lastInspectionDate,
    nextInspectionDate,
    intervalYears: normalizedInterval,
    status,
    daysUntilDue: diffDays,
  };
}
