import { getGasBoilerByHome } from "@/infrastructure/gasBoilerRepository";

export async function getGasBoilerUseCase(homeId: number) {
  return getGasBoilerByHome(homeId);
}
