import { listGasBillsByHomeAndYears } from "@/infrastructure/gasRepository";
import {
  buildYearComparison,
  type ComparisonBillItem,
  type YearComparison,
} from "@/usecases/billComparisons";

export async function getGasComparisonUseCase(
  homeId: number,
  yearA: number,
  yearB: number
): Promise<YearComparison | null> {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  const bills = await listGasBillsByHomeAndYears(homeId, [yearA, yearB]);
  if (bills.length === 0) {
    return null;
  }

  const comparisonBills: ComparisonBillItem[] = bills.map((bill) => ({
    id: bill.id,
    issueDate: bill.issueDate,
    totalAmount: bill.totalAmount,
    usage: bill.consumptionKwh,
    periodDays: bill.periodDays ?? null,
    invoiceNumber: bill.invoiceNumber ?? null,
  }));

  return buildYearComparison(comparisonBills, yearA, yearB);
}
