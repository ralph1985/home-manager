import {
  getGasBillById,
  listGasBillDatesByHome,
  listGasBillsByHome,
} from "@/infrastructure/gasRepository";

export async function listGasBillsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  return listGasBillsByHome(homeId);
}

export async function getGasBillUseCase(homeId: number, billId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  if (!Number.isInteger(billId) || billId <= 0) {
    return null;
  }

  return getGasBillById(homeId, billId);
}

export async function listGasBillYearsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  const bills = await listGasBillDatesByHome(homeId);
  const uniqueYears = new Set<number>();

  bills.forEach((bill) => {
    uniqueYears.add(bill.issueDate.getUTCFullYear());
  });

  return Array.from(uniqueYears).sort((a, b) => b - a);
}
