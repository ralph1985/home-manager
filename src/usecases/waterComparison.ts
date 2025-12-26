import { listWaterBillsByHomeAndYears } from "@/infrastructure/waterRepository";
import {
  buildYearComparison,
  type ComparisonBillItem,
  type YearComparison,
} from "@/usecases/billComparisons";

export async function getWaterComparisonUseCase(
  homeId: number,
  yearA: number,
  yearB: number
): Promise<YearComparison | null> {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  const bills = await listWaterBillsByHomeAndYears(homeId, [yearA, yearB]);
  if (bills.length === 0) {
    return null;
  }

  const comparisonBills: ComparisonBillItem[] = bills.map((bill) => ({
    id: bill.id,
    issueDate: bill.issueDate,
    totalAmount: bill.totalAmount,
    usage: bill.consumptionM3,
    invoiceNumber: bill.invoiceNumber ?? null,
  }));

  return buildYearComparison(comparisonBills, yearA, yearB);
}
