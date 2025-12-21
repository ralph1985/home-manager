import { prisma } from "@/infrastructure/prisma";

export async function listHomes() {
  return prisma.home.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getHomeById(homeId: number) {
  return prisma.home.findUnique({
    where: { id: homeId },
  });
}
