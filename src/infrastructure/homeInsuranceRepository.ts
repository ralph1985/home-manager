import type { HomeInsuranceDetails, HomeInsurancePolicy } from "@/domain/HomeInsurance";
import type { HomeInsurancePolicy as PrismaHomeInsurancePolicy, Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

const toNumber = (value: { toString(): string } | null) =>
  value == null ? null : Number(value.toString());

const normalizeDetails = (details: Prisma.JsonValue | null): HomeInsuranceDetails | null =>
  isRecord(details) ? (details as HomeInsuranceDetails) : null;

const mapHomeInsurancePolicy = (
  policy: PrismaHomeInsurancePolicy,
): HomeInsurancePolicy => ({
  ...policy,
  revaluationPct: toNumber(policy.revaluationPct),
  premiumTotal: toNumber(policy.premiumTotal),
  details: normalizeDetails(policy.details),
});

export async function listHomeInsurancePoliciesByHome(homeId: number) {
  const policies = await prisma.homeInsurancePolicy.findMany({
    where: { homeId },
    orderBy: { effectiveDate: "desc" },
  });

  return policies.map(mapHomeInsurancePolicy);
}

export async function getHomeInsurancePolicyById(homeId: number, policyId: number) {
  const policy = await prisma.homeInsurancePolicy.findFirst({
    where: { id: policyId, homeId },
  });

  return policy ? mapHomeInsurancePolicy(policy) : null;
}
