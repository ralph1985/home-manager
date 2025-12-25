import { getGasBillById, listGasBillsByHome } from "@/infrastructure/gasRepository";

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
