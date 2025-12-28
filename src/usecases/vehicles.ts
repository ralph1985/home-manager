import {
  getVehicleById,
  getVehicleMaintenanceById,
  getVehiclePurchaseByVehicleId,
  listVehicleMaintenances,
  listVehicles,
} from "@/infrastructure/vehicleRepository";

export async function listVehiclesUseCase() {
  return listVehicles();
}

export async function getVehicleUseCase(vehicleId: number) {
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return null;
  }

  return getVehicleById(vehicleId);
}

export async function listVehicleMaintenancesUseCase(vehicleId: number) {
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return [];
  }

  return listVehicleMaintenances(vehicleId);
}

export async function getVehicleMaintenanceUseCase(vehicleId: number, maintenanceId: number) {
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return null;
  }

  if (!Number.isInteger(maintenanceId) || maintenanceId <= 0) {
    return null;
  }

  return getVehicleMaintenanceById(vehicleId, maintenanceId);
}

export async function getVehiclePurchaseUseCase(vehicleId: number) {
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return null;
  }

  return getVehiclePurchaseByVehicleId(vehicleId);
}
