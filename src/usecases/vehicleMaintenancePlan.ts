import { getVehicleMaintenancePlanByVehicleId } from "@/infrastructure/vehicleRepository";

type MaintenancePlanItem = {
  id: number;
  title: string;
  intervalKmMin: number | null;
  intervalKmMax: number | null;
  intervalMonths: number | null;
  actions: string[];
  notes: string | null;
  sortOrder: number;
};

export type UpcomingMaintenance = {
  id: number;
  title: string;
  dueDate: Date | null;
  dueDateEstimated: boolean;
  dueKmMin: number | null;
  dueKmMax: number | null;
  actions: string[];
  notes: string | null;
};

export type VehicleMaintenancePlan = {
  startDate: Date;
  kmPerYear: number;
  items: MaintenancePlanItem[];
  upcoming: UpcomingMaintenance[];
};

const normalizeActions = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((action): action is string => typeof action === "string");
};

const addMonths = (value: Date, months: number) => {
  const result = new Date(value);
  const initialDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < initialDay) {
    result.setDate(0);
  }
  return result;
};

export async function getVehicleMaintenancePlanUseCase(vehicleId: number) {
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return null;
  }

  const plan = await getVehicleMaintenancePlanByVehicleId(vehicleId);
  if (!plan) {
    return null;
  }

  const kmPerYear = plan.kmPerYear || 25000;
  const startDate = plan.startDate;

  const items: MaintenancePlanItem[] = plan.items.map((item) => ({
    id: item.id,
    title: item.title,
    intervalKmMin: item.intervalKmMin,
    intervalKmMax: item.intervalKmMax,
    intervalMonths: item.intervalMonths,
    actions: normalizeActions(item.actions),
    notes: item.notes,
    sortOrder: item.sortOrder,
  }));

  const upcoming: UpcomingMaintenance[] = items.map((item) => {
    if (item.intervalMonths != null) {
      return {
        id: item.id,
        title: item.title,
        dueDate: addMonths(startDate, item.intervalMonths),
        dueDateEstimated: false,
        dueKmMin: item.intervalKmMin,
        dueKmMax: item.intervalKmMax,
        actions: item.actions,
        notes: item.notes,
      };
    }

    if (item.intervalKmMin != null) {
      const monthsFromKm = Math.round((item.intervalKmMin / kmPerYear) * 12);
      return {
        id: item.id,
        title: item.title,
        dueDate: addMonths(startDate, monthsFromKm),
        dueDateEstimated: true,
        dueKmMin: item.intervalKmMin,
        dueKmMax: item.intervalKmMax,
        actions: item.actions,
        notes: item.notes,
      };
    }

    return {
      id: item.id,
      title: item.title,
      dueDate: null,
      dueDateEstimated: false,
      dueKmMin: item.intervalKmMin,
      dueKmMax: item.intervalKmMax,
      actions: item.actions,
      notes: item.notes,
    };
  });

  return {
    startDate,
    kmPerYear,
    items,
    upcoming,
  } satisfies VehicleMaintenancePlan;
}
