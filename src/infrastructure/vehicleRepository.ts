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
    specs: true;
    registrationDocument: true;
  };
}>;

export type VehicleMaintenanceListItem = Prisma.VehicleMaintenanceGetPayload<{
  include: { workshop: true };
}>;

export type VehicleMaintenanceDetail = Prisma.VehicleMaintenanceGetPayload<{
  include: { workshop: true; vehicle: true };
}>;

export type VehiclePurchaseDetail = Prisma.VehiclePurchaseGetPayload<{
  include: { options: true };
}>;

export type VehicleInsuranceDetail = Prisma.VehicleInsuranceGetPayload<{
  include: { vehicle: true };
}>;

export type VehicleMaintenancePlanDetail = Prisma.VehicleMaintenancePlanGetPayload<{
  include: { items: true };
}>;

export type VehicleMaintenancePlanCompletion = Prisma.VehicleMaintenanceGetPayload<{
  select: { planItemId: true; serviceDate: true; odometerKm: true };
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
    include: {
      _count: { select: { maintenances: true } },
      specs: true,
      registrationDocument: true,
    },
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

export async function getVehiclePurchaseByVehicleId(vehicleId: number) {
  return prisma.vehiclePurchase.findUnique({
    where: { vehicleId },
    include: { options: true },
  });
}

export async function getVehicleInsuranceByVehicleId(vehicleId: number) {
  return prisma.vehicleInsurance.findUnique({
    where: { vehicleId },
    include: { vehicle: true },
  });
}

export async function getVehicleMaintenancePlanByVehicleId(vehicleId: number) {
  return prisma.vehicleMaintenancePlan.findUnique({
    where: { vehicleId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getVehicleMaintenancePlanItem(vehicleId: number, planItemId: number) {
  return prisma.vehicleMaintenancePlanItem.findFirst({
    where: {
      id: planItemId,
      plan: { vehicleId },
    },
  });
}

export async function listVehicleMaintenancePlanCompletions(vehicleId: number) {
  return prisma.vehicleMaintenance.findMany({
    where: { vehicleId, planItemId: { not: null } },
    select: { planItemId: true, serviceDate: true, odometerKm: true },
    orderBy: [{ serviceDate: "desc" }, { id: "desc" }],
  });
}

export async function createVehicleMaintenanceFromPlan({
  vehicleId,
  planItemId,
  title,
  description,
  serviceDate,
  odometerKm,
}: {
  vehicleId: number;
  planItemId: number;
  title: string;
  description: string | null;
  serviceDate: Date;
  odometerKm: number | null;
}) {
  return prisma.vehicleMaintenance.create({
    data: {
      vehicleId,
      planItemId,
      title,
      description,
      serviceDate,
      odometerKm,
    },
  });
}
