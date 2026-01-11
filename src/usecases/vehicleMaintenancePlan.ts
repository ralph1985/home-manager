import {
  createVehicleMaintenanceFromPlan,
  getVehicleMaintenancePlanByVehicleId,
  getVehicleMaintenancePlanItem,
  listVehicleMaintenancePlanCompletions,
} from "@/infrastructure/vehicleRepository";

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
  lastCompletedAt: Date | null;
  lastCompletedKm: number | null;
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

  const completions = await listVehicleMaintenancePlanCompletions(vehicleId);
  const completionByItem = new Map<number, { serviceDate: Date; odometerKm: number | null }>();
  completions.forEach((completion) => {
    if (completion.planItemId == null || completionByItem.has(completion.planItemId)) {
      return;
    }
    completionByItem.set(completion.planItemId, {
      serviceDate: completion.serviceDate,
      odometerKm: completion.odometerKm ?? null,
    });
  });

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
    const completion = completionByItem.get(item.id) ?? null;
    const baseDate = completion?.serviceDate ?? startDate;
    const baseKm = completion?.odometerKm ?? null;

    if (item.intervalMonths != null) {
      return {
        id: item.id,
        title: item.title,
        dueDate: addMonths(baseDate, item.intervalMonths),
        dueDateEstimated: false,
        dueKmMin:
          baseKm != null && item.intervalKmMin != null
            ? baseKm + item.intervalKmMin
            : item.intervalKmMin,
        dueKmMax:
          baseKm != null && item.intervalKmMax != null
            ? baseKm + item.intervalKmMax
            : item.intervalKmMax,
        actions: item.actions,
        notes: item.notes,
        lastCompletedAt: completion?.serviceDate ?? null,
        lastCompletedKm: completion?.odometerKm ?? null,
      };
    }

    if (item.intervalKmMin != null) {
      const monthsFromKm = Math.round((item.intervalKmMin / kmPerYear) * 12);
      return {
        id: item.id,
        title: item.title,
        dueDate: addMonths(baseDate, monthsFromKm),
        dueDateEstimated: true,
        dueKmMin: baseKm != null ? baseKm + item.intervalKmMin : item.intervalKmMin,
        dueKmMax:
          baseKm != null && item.intervalKmMax != null
            ? baseKm + item.intervalKmMax
            : item.intervalKmMax,
        actions: item.actions,
        notes: item.notes,
        lastCompletedAt: completion?.serviceDate ?? null,
        lastCompletedKm: completion?.odometerKm ?? null,
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
      lastCompletedAt: completion?.serviceDate ?? null,
      lastCompletedKm: completion?.odometerKm ?? null,
    };
  });

  return {
    startDate,
    kmPerYear,
    items,
    upcoming,
  } satisfies VehicleMaintenancePlan;
}

type CompleteMaintenancePlanItemInput = {
  vehicleId: number;
  planItemId: number;
  serviceDate: Date;
  odometerKm: number | null;
};

const buildMaintenanceDescription = (actions: string[], notes: string | null) => {
  const lines: string[] = [];
  if (actions.length > 0) {
    lines.push(`Trabajos: ${actions.join("; ")}`);
  }
  if (notes) {
    lines.push(notes);
  }
  return lines.length > 0 ? lines.join("\n") : null;
};

export async function completeVehicleMaintenancePlanItemUseCase({
  vehicleId,
  planItemId,
  serviceDate,
  odometerKm,
}: CompleteMaintenancePlanItemInput) {
  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return null;
  }
  if (!Number.isInteger(planItemId) || planItemId <= 0) {
    return null;
  }
  if (!(serviceDate instanceof Date) || Number.isNaN(serviceDate.getTime())) {
    return null;
  }

  const planItem = await getVehicleMaintenancePlanItem(vehicleId, planItemId);
  if (!planItem) {
    return null;
  }

  const actions = normalizeActions(planItem.actions);
  const description = buildMaintenanceDescription(actions, planItem.notes ?? null);

  return createVehicleMaintenanceFromPlan({
    vehicleId,
    planItemId,
    title: planItem.title,
    description,
    serviceDate,
    odometerKm,
  });
}
