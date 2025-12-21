import { getHomeById, listHomes } from "@/infrastructure/homeRepository";

export async function listHomesUseCase() {
  return listHomes();
}

export async function getHomeUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  return getHomeById(homeId);
}
