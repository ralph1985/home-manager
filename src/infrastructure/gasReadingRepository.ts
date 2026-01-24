import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type GasReadingListItem = Prisma.GasReadingGetPayload<{
  include: { supplyPoint: true; bill: true };
}>;

export type GasSupplyPointListItem = Prisma.GasSupplyPointGetPayload<{
  select: {
    id: true;
    cups: true;
    addressLine: true;
  };
}>;

type GasReadingInput = {
  readingDate: Date;
  readingM3: number;
  notes?: string | null;
  supplyPointId?: number | null;
  isEstimated?: boolean;
  billId?: number | null;
};

export async function listGasReadingsByHome(homeId: number) {
  return prisma.gasReading.findMany({
    where: { homeId },
    include: { supplyPoint: true, bill: true },
    orderBy: { readingDate: "desc" },
  });
}

export async function listGasSupplyPointsByHome(homeId: number) {
  return prisma.gasSupplyPoint.findMany({
    where: { homeId },
    select: { id: true, cups: true, addressLine: true },
    orderBy: { cups: "asc" },
  });
}

export async function getGasSupplyPointById(homeId: number, supplyPointId: number) {
  return prisma.gasSupplyPoint.findFirst({
    where: { id: supplyPointId, homeId },
    select: { id: true },
  });
}

export async function findGasBillForReading(homeId: number, readingDate: Date) {
  return prisma.gasBill.findFirst({
    where: {
      homeId,
      periodStart: { lte: readingDate },
      periodEnd: { gte: readingDate },
    },
    select: { id: true, invoiceNumber: true, periodStart: true, periodEnd: true },
    orderBy: { periodEnd: "desc" },
  });
}

export async function createGasReading(homeId: number, input: GasReadingInput) {
  return prisma.gasReading.create({
    data: {
      homeId,
      readingDate: input.readingDate,
      readingM3: input.readingM3,
      notes: input.notes ?? null,
      isEstimated: input.isEstimated ?? false,
      supplyPointId: input.supplyPointId ?? null,
      billId: input.billId ?? null,
    },
    include: { supplyPoint: true, bill: true },
  });
}

export async function updateGasReading(homeId: number, readingId: number, input: GasReadingInput) {
  const result = await prisma.gasReading.updateMany({
    where: { id: readingId, homeId },
    data: {
      readingDate: input.readingDate,
      readingM3: input.readingM3,
      notes: input.notes ?? null,
      isEstimated: input.isEstimated ?? false,
      supplyPointId: input.supplyPointId ?? null,
      billId: input.billId ?? null,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.gasReading.findFirst({
    where: { id: readingId, homeId },
    include: { supplyPoint: true, bill: true },
  });
}

export async function deleteGasReading(homeId: number, readingId: number) {
  const result = await prisma.gasReading.deleteMany({
    where: { id: readingId, homeId },
  });
  return result.count > 0;
}
