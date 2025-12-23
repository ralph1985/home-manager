import type { Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/prisma";

export type VehicleListItem = Prisma.VehicleGetPayload<{
  include: {
    _count: { select: { maintenances: true } };
  };
}>;

export type VehicleDetail = Prisma.VehicleGetPayload<{
  include: {
    _count: { select: { maintenances: true } };
  };
}>;

export type VehicleMaintenanceListItem = Prisma.VehicleMaintenanceGetPayload<{
  include: { workshop: true };
}>;

export type VehicleMaintenanceDetail = Prisma.VehicleMaintenanceGetPayload<{
  include: { workshop: true; vehicle: true };
}>;

export async function listVehicles() {
  return prisma.vehicle.findMany({
    include: {
      _count: { select: { maintenances: true } },
    },
    orderBy: [{ brand: "asc" }, { model: "asc" }, { year: "desc" }],
  });
}

export async function getVehicleById(vehicleId: number) {
  return prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { _count: { select: { maintenances: true } } },
  });
}

export async function listVehicleMaintenances(vehicleId: number) {
  return prisma.vehicleMaintenance.findMany({
    where: { vehicleId },
    include: { workshop: true },
    orderBy: [{ serviceDate: "desc" }, { id: "desc" }],
  });
}

export async function getVehicleMaintenanceById(vehicleId: number, maintenanceId: number) {
  return prisma.vehicleMaintenance.findFirst({
    where: { id: maintenanceId, vehicleId },
    include: { workshop: true, vehicle: true },
  });
}
