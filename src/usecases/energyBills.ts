import { getEnergyBillById, listEnergyBillsByHome } from "@/infrastructure/energyRepository";

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
