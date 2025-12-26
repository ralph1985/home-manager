import {
  getWaterBillById,
  listWaterBillDatesByHome,
  listWaterBillsByHome,
} from "@/infrastructure/waterRepository";

export async function listWaterBillsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  return listWaterBillsByHome(homeId);
}

export async function getWaterBillUseCase(homeId: number, billId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  if (!Number.isInteger(billId) || billId <= 0) {
    return null;
  }

  return getWaterBillById(homeId, billId);
}

export async function listWaterBillYearsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  const bills = await listWaterBillDatesByHome(homeId);
  const uniqueYears = new Set<number>();

  bills.forEach((bill) => {
    uniqueYears.add(bill.issueDate.getUTCFullYear());
  });

  return Array.from(uniqueYears).sort((a, b) => b - a);
}
