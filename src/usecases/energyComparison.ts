import type { EnergyBillComparisonItem } from "@/infrastructure/energyRepository";
import { listEnergyBillsByHomeAndYears } from "@/infrastructure/energyRepository";

type EnergyMonthMetrics = {
  amount: number;
  kwh: number | null;
  eurPerKwh: number | null;
  days: number | null;
};

export type EnergyComparisonBillRef = {
  id: number;
  invoiceNumber: string | null;
};

export type EnergyComparisonMonth = {
  month: number;
  yearA: EnergyMonthMetrics | null;
  yearB: EnergyMonthMetrics | null;
  deltaAmount: number | null;
  deltaKwh: number | null;
  billsA: EnergyComparisonBillRef[];
  billsB: EnergyComparisonBillRef[];
};

export type EnergyComparisonSummary = {
  year: number;
  amount: number;
  kwh: number | null;
  eurPerKwh: number | null;
};

export type EnergyComparison = {
  yearA: number;
  yearB: number;
  months: EnergyComparisonMonth[];
  summary: {
    yearA: EnergyComparisonSummary;
    yearB: EnergyComparisonSummary;
    deltaAmount: number | null;
    deltaKwh: number | null;
  };
};

type MonthAccumulator = {
  amount: number;
  kwh: number;
  days: number;
  hasKwh: boolean;
  hasDays: boolean;
  bills: EnergyComparisonBillRef[];
};

const toNumber = (value?: { toString(): string } | null) =>
  value == null ? null : Number(value.toString());

const createAccumulator = (): MonthAccumulator => ({
  amount: 0,
  kwh: 0,
  days: 0,
  hasKwh: false,
  hasDays: false,
  bills: [],
});

const toMetrics = (acc: MonthAccumulator): EnergyMonthMetrics => {
  const kwh = acc.hasKwh ? acc.kwh : null;
  const days = acc.hasDays ? acc.days : null;
  const eurPerKwh = kwh && kwh > 0 ? acc.amount / kwh : null;

  return {
    amount: acc.amount,
    kwh,
    eurPerKwh,
    days,
  };
};

const extractYear = (date: Date) => date.getUTCFullYear();
const extractMonth = (date: Date) => date.getUTCMonth() + 1;

function buildYearMap(bills: EnergyBillComparisonItem[], years: number[]) {
  const yearSet = new Set(years);
  const yearMap = new Map<number, Map<number, MonthAccumulator>>();

  bills.forEach((bill) => {
    const year = extractYear(bill.issueDate);
    if (!yearSet.has(year)) return;
    const month = extractMonth(bill.issueDate);
    const amount = toNumber(bill.totalAmount) ?? 0;
    const kwh = toNumber(bill.consumptionKwh);
    const days = bill.periodDays ?? null;

    const months = yearMap.get(year) ?? new Map<number, MonthAccumulator>();
    const acc = months.get(month) ?? createAccumulator();
    acc.amount += amount;
    if (kwh != null) {
      acc.kwh += kwh;
      acc.hasKwh = true;
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

function buildSummary(year: number, months: EnergyMonthMetrics[]) {
  const amount = months.reduce((total, month) => total + month.amount, 0);
  const kwhValues = months.map((month) => month.kwh).filter((value) => value != null);
  const kwh = kwhValues.length > 0 ? kwhValues.reduce((total, value) => total + value, 0) : null;
  const eurPerKwh = kwh && kwh > 0 ? amount / kwh : null;

  return {
    year,
    amount,
    kwh,
    eurPerKwh,
  };
}

export async function getEnergyComparisonUseCase(
  homeId: number,
  yearA: number,
  yearB: number
): Promise<EnergyComparison | null> {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  const years = [yearA, yearB].filter((year) => Number.isInteger(year));
  if (years.length !== 2) {
    return null;
  }

  const bills = await listEnergyBillsByHomeAndYears(homeId, years);
  if (bills.length === 0) {
    return null;
  }

  const yearMap = buildYearMap(bills, years);
  if (!yearMap.has(yearA) || !yearMap.has(yearB)) {
    return null;
  }
  const monthDataA = yearMap.get(yearA) ?? new Map<number, MonthAccumulator>();
  const monthDataB = yearMap.get(yearB) ?? new Map<number, MonthAccumulator>();

  const monthsA: EnergyMonthMetrics[] = [];
  const monthsB: EnergyMonthMetrics[] = [];

  const months: EnergyComparisonMonth[] = Array.from({ length: 12 }, (_, index) => {
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
      deltaKwh:
        metricsA?.kwh != null && metricsB?.kwh != null
          ? Number((metricsB.kwh - metricsA.kwh).toFixed(2))
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
      deltaKwh:
        summaryA.kwh != null && summaryB.kwh != null
          ? Number((summaryB.kwh - summaryA.kwh).toFixed(2))
          : null,
    },
  };
}
