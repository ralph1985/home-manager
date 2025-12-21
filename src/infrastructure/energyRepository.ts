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

export async function listEnergyBillsByHome(homeId: number) {
  return prisma.electricityBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
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
