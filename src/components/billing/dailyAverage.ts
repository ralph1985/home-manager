import { parseDate } from "@/components/tables/tableUtils";

type DailyAverageRow = {
  periodStart?: Date | string | number | null;
  periodEnd?: Date | string | number | null;
  totalAmountValue?: number | null;
  totalAmount: { toString(): string } | string | number;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calculateDailyAverage(rows: DailyAverageRow[]) {
  const totalDays = rows.reduce((total, row) => {
    if (!row.periodStart || !row.periodEnd) return total;
    const start = parseDate(row.periodStart).getTime();
    const end = parseDate(row.periodEnd).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return total;
    return total + Math.max(1, Math.round((end - start) / MS_PER_DAY));
  }, 0);

  const totalAmount = rows.reduce((total, row) => {
    const raw =
      row.totalAmountValue != null ? row.totalAmountValue : Number(row.totalAmount.toString());
    return Number.isFinite(raw) ? total + raw : total;
  }, 0);

  return {
    dailyAverage: totalDays > 0 ? totalAmount / totalDays : null,
    totalDays,
    totalAmount,
  };
}
