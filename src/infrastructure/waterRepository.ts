import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type WaterBillListItem = Prisma.WaterBillGetPayload<{ include: { provider: true } }>;

export type WaterBillDetail = Prisma.WaterBillGetPayload<{
  include: {
    provider: true;
    supplyPoint: true;
    costLines: { include: { category: true } };
  };
}>;

export async function listWaterBillsByHome(homeId: number) {
  return prisma.waterBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
  });
}

export async function getWaterBillById(homeId: number, billId: number) {
  return prisma.waterBill.findFirst({
    where: { id: billId, homeId },
    include: {
      provider: true,
      supplyPoint: true,
      costLines: { include: { category: true } },
    },
  });
}
