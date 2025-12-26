import {
  getEnergyBillById,
  listEnergyBillDatesByHome,
  listEnergyBillsByHome,
} from "@/infrastructure/energyRepository";

export async function listEnergyBillsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  return listEnergyBillsByHome(homeId);
}

export async function getEnergyBillUseCase(homeId: number, billId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  if (!Number.isInteger(billId) || billId <= 0) {
    return null;
  }

  return getEnergyBillById(homeId, billId);
}

export async function listEnergyBillYearsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  const bills = await listEnergyBillDatesByHome(homeId);
  const uniqueYears = new Set<number>();

  bills.forEach((bill) => {
    uniqueYears.add(bill.issueDate.getUTCFullYear());
  });

  return Array.from(uniqueYears).sort((a, b) => b - a);
}
