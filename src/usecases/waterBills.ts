import { getWaterBillById, listWaterBillsByHome } from "@/infrastructure/waterRepository";

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
