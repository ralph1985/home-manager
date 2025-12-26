import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type WaterBillListItem = Prisma.WaterBillGetPayload<{ include: { provider: true } }>;

export type WaterBillDetail = Prisma.WaterBillGetPayload<{
  include: {
    provider: true;
    supplyPoint: true;
    cancelsBill: true;
    costLines: { include: { category: true } };
  };
}>;

export type WaterBillComparisonItem = Prisma.WaterBillGetPayload<{
  select: {
    id: true;
    issueDate: true;
    totalAmount: true;
    consumptionM3: true;
    invoiceNumber: true;
  };
}>;

export async function listWaterBillsByHome(homeId: number) {
  return prisma.waterBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
  });
}

export async function listWaterBillsByHomeAndYears(homeId: number, years: number[]) {
  if (years.length === 0) return [];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const start = new Date(Date.UTC(minYear, 0, 1));
  const end = new Date(Date.UTC(maxYear + 1, 0, 1));

  return prisma.waterBill.findMany({
    where: { homeId, issueDate: { gte: start, lt: end } },
    select: {
      id: true,
      issueDate: true,
      totalAmount: true,
      consumptionM3: true,
      invoiceNumber: true,
    },
    orderBy: { issueDate: "asc" },
  });
}

export async function listWaterBillDatesByHome(homeId: number) {
  return prisma.waterBill.findMany({
    where: { homeId },
    select: { issueDate: true },
    orderBy: { issueDate: "asc" },
  });
}

export async function getWaterBillById(homeId: number, billId: number) {
  return prisma.waterBill.findFirst({
    where: { id: billId, homeId },
    include: {
      provider: true,
      supplyPoint: true,
      cancelsBill: true,
      costLines: { include: { category: true } },
    },
  });
}
