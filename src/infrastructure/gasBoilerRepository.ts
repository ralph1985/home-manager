import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type GasBoilerDetail = Prisma.GasBoilerGetPayload<{
  include: {
    maintenanceEvents: true;
  };
}>;

export async function getGasBoilerByHome(homeId: number) {
  return prisma.gasBoiler.findUnique({
    where: { homeId },
    include: { maintenanceEvents: { orderBy: [{ eventDate: "desc" }, { id: "desc" }] } },
  });
}
