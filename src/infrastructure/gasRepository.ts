import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type GasBillListItem = Prisma.GasBillGetPayload<{ include: { provider: true } }>;

export type GasBillDetail = Prisma.GasBillGetPayload<{
  include: {
    provider: true;
    supplyPoint: true;
    costLines: { include: { category: true } };
  };
}>;

export type GasBillComparisonItem = Prisma.GasBillGetPayload<{
  select: {
    id: true;
    issueDate: true;
    totalAmount: true;
    consumptionKwh: true;
    periodDays: true;
    invoiceNumber: true;
  };
}>;

export async function listGasBillsByHome(homeId: number) {
  return prisma.gasBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
  });
}

export async function listGasBillsByHomeAndYears(homeId: number, years: number[]) {
  if (years.length === 0) return [];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const start = new Date(Date.UTC(minYear, 0, 1));
  const end = new Date(Date.UTC(maxYear + 1, 0, 1));

  return prisma.gasBill.findMany({
    where: { homeId, issueDate: { gte: start, lt: end } },
    select: {
      id: true,
      issueDate: true,
      totalAmount: true,
      consumptionKwh: true,
      periodDays: true,
      invoiceNumber: true,
    },
    orderBy: { issueDate: "asc" },
  });
}

export async function listGasBillDatesByHome(homeId: number) {
  return prisma.gasBill.findMany({
    where: { homeId },
    select: { issueDate: true },
    orderBy: { issueDate: "asc" },
  });
}

export async function getGasBillById(homeId: number, billId: number) {
  return prisma.gasBill.findFirst({
    where: { id: billId, homeId },
    include: {
      provider: true,
      supplyPoint: true,
      costLines: { include: { category: true } },
    },
  });
}
