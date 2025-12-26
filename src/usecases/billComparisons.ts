export type YearComparisonBillRef = {
  id: number;
  invoiceNumber: string | null;
};

export type YearComparisonMetrics = {
  amount: number;
  usage: number | null;
  eurPerUnit: number | null;
  days: number | null;
};

export type YearComparisonMonth = {
  month: number;
  yearA: YearComparisonMetrics | null;
  yearB: YearComparisonMetrics | null;
  deltaAmount: number | null;
  deltaUsage: number | null;
  billsA: YearComparisonBillRef[];
  billsB: YearComparisonBillRef[];
};

export type YearComparisonSummary = {
  year: number;
  amount: number;
  usage: number | null;
  eurPerUnit: number | null;
};

export type YearComparison = {
  yearA: number;
  yearB: number;
  months: YearComparisonMonth[];
  summary: {
    yearA: YearComparisonSummary;
    yearB: YearComparisonSummary;
    deltaAmount: number | null;
    deltaUsage: number | null;
  };
};

export type ComparisonBillItem = {
  id: number;
  issueDate: Date;
  totalAmount: number | string | { toString(): string };
  usage: number | string | { toString(): string } | null;
  periodDays?: number | null;
  invoiceNumber?: string | null;
};

type MonthAccumulator = {
  amount: number;
  usage: number;
  days: number;
  hasUsage: boolean;
  hasDays: boolean;
  bills: YearComparisonBillRef[];
};

const toNumber = (value?: { toString(): string } | number | string | null) => {
  if (value == null) return null;
  return Number(value.toString());
};

const createAccumulator = (): MonthAccumulator => ({
  amount: 0,
  usage: 0,
  days: 0,
  hasUsage: false,
  hasDays: false,
  bills: [],
});

const toMetrics = (acc: MonthAccumulator): YearComparisonMetrics => {
  const usage = acc.hasUsage ? acc.usage : null;
  const days = acc.hasDays ? acc.days : null;
  const eurPerUnit = usage && usage > 0 ? acc.amount / usage : null;

  return {
    amount: acc.amount,
    usage,
    eurPerUnit,
    days,
  };
};

const extractYear = (date: Date) => date.getUTCFullYear();
const extractMonth = (date: Date) => date.getUTCMonth() + 1;

function buildYearMap(bills: ComparisonBillItem[], years: number[]) {
  const yearSet = new Set(years);
  const yearMap = new Map<number, Map<number, MonthAccumulator>>();

  bills.forEach((bill) => {
    const year = extractYear(bill.issueDate);
    if (!yearSet.has(year)) return;
    const month = extractMonth(bill.issueDate);
    const amount = toNumber(bill.totalAmount) ?? 0;
    const usage = toNumber(bill.usage);
    const days = bill.periodDays ?? null;

    const months = yearMap.get(year) ?? new Map<number, MonthAccumulator>();
    const acc = months.get(month) ?? createAccumulator();
    acc.amount += amount;
    if (usage != null) {
      acc.usage += usage;
      acc.hasUsage = true;
    }
    if (days != null) {
      acc.days += days;
      acc.hasDays = true;
    }
    acc.bills.push({ id: bill.id, invoiceNumber: bill.invoiceNumber ?? null });
    months.set(month, acc);
    yearMap.set(year, months);
  });

  return yearMap;
}

function buildSummary(year: number, months: YearComparisonMetrics[]) {
  const amount = months.reduce((total, month) => total + month.amount, 0);
  const usageValues = months.map((month) => month.usage).filter((value) => value != null);
  const usage =
    usageValues.length > 0 ? usageValues.reduce((total, value) => total + value, 0) : null;
  const eurPerUnit = usage && usage > 0 ? amount / usage : null;

  return {
    year,
    amount,
    usage,
    eurPerUnit,
  };
}

export function buildYearComparison(
  bills: ComparisonBillItem[],
  yearA: number,
  yearB: number
): YearComparison | null {
  const years = [yearA, yearB].filter((year) => Number.isInteger(year));
  if (years.length !== 2) {
    return null;
  }

  const yearMap = buildYearMap(bills, years);
  if (!yearMap.has(yearA) || !yearMap.has(yearB)) {
    return null;
  }

  const monthDataA = yearMap.get(yearA) ?? new Map<number, MonthAccumulator>();
  const monthDataB = yearMap.get(yearB) ?? new Map<number, MonthAccumulator>();

  const monthsA: YearComparisonMetrics[] = [];
  const monthsB: YearComparisonMetrics[] = [];

  const months: YearComparisonMonth[] = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const accA = monthDataA.get(month);
    const accB = monthDataB.get(month);
    const metricsA = accA ? toMetrics(accA) : null;
    const metricsB = accB ? toMetrics(accB) : null;

    if (metricsA) monthsA.push(metricsA);
    if (metricsB) monthsB.push(metricsB);

    return {
      month,
      yearA: metricsA,
      yearB: metricsB,
      deltaAmount:
        metricsA && metricsB ? Number((metricsB.amount - metricsA.amount).toFixed(2)) : null,
      deltaUsage:
        metricsA?.usage != null && metricsB?.usage != null
          ? Number((metricsB.usage - metricsA.usage).toFixed(2))
          : null,
      billsA: accA?.bills ?? [],
      billsB: accB?.bills ?? [],
    };
  });

  const summaryA = buildSummary(yearA, monthsA);
  const summaryB = buildSummary(yearB, monthsB);

  return {
    yearA,
    yearB,
    months,
    summary: {
      yearA: summaryA,
      yearB: summaryB,
      deltaAmount: Number((summaryB.amount - summaryA.amount).toFixed(2)),
      deltaUsage:
        summaryA.usage != null && summaryB.usage != null
          ? Number((summaryB.usage - summaryA.usage).toFixed(2))
          : null,
    },
  };
}
