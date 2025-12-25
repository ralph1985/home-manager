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

export async function listGasBillsByHome(homeId: number) {
  return prisma.gasBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
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
