import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type EnergyBillListItem = Prisma.ElectricityBillGetPayload<{ include: { provider: true } }>;

export type EnergyBillDetail = Prisma.ElectricityBillGetPayload<{
  include: {
    provider: true;
    supplyPoint: true;
    costLines: { include: { category: true } };
  };
}>;

export type EnergyBillComparisonItem = Prisma.ElectricityBillGetPayload<{
  select: {
    id: true;
    issueDate: true;
    totalAmount: true;
    consumptionKwh: true;
    periodDays: true;
    invoiceNumber: true;
  };
}>;

export async function listEnergyBillsByHome(homeId: number) {
  return prisma.electricityBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
  });
}

export async function listEnergyBillsByHomeAndYears(homeId: number, years: number[]) {
  if (years.length === 0) return [];
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const start = new Date(Date.UTC(minYear, 0, 1));
  const end = new Date(Date.UTC(maxYear + 1, 0, 1));

  return prisma.electricityBill.findMany({
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

export async function listEnergyBillDatesByHome(homeId: number) {
  return prisma.electricityBill.findMany({
    where: { homeId },
    select: { issueDate: true },
    orderBy: { issueDate: "asc" },
  });
}

export async function getEnergyBillById(homeId: number, billId: number) {
  return prisma.electricityBill.findFirst({
    where: { id: billId, homeId },
    include: {
      provider: true,
      supplyPoint: true,
      costLines: { include: { category: true } },
    },
  });
}
