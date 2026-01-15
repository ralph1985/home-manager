import {
  getHomeInsurancePolicyById,
  listHomeInsurancePoliciesByHome,
} from "@/infrastructure/homeInsuranceRepository";

export async function listHomeInsurancePoliciesUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  return listHomeInsurancePoliciesByHome(homeId);
}

export async function getHomeInsurancePolicyUseCase(homeId: number, policyId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  if (!Number.isInteger(policyId) || policyId <= 0) {
    return null;
  }

  return getHomeInsurancePolicyById(homeId, policyId);
}
