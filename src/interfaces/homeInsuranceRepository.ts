import type { HomeInsurancePolicy } from "@/domain/HomeInsurance";

export interface HomeInsuranceRepository {
  listPoliciesByHome(homeId: number): Promise<HomeInsurancePolicy[]>;
  getPolicyById(homeId: number, policyId: number): Promise<HomeInsurancePolicy | null>;
}
