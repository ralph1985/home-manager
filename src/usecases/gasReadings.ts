import { getGasBillById } from "@/infrastructure/gasRepository";
import {
  createGasReading,
  deleteGasReading,
  findGasBillForReading,
  getGasSupplyPointById,
  listGasReadingsByHome,
  listGasSupplyPointsByHome,
  updateGasReading,
} from "@/infrastructure/gasReadingRepository";

type GasReadingInput = {
  homeId: number;
  readingDate: Date;
  readingM3: number;
  notes?: string | null;
  supplyPointId?: number | null;
  isEstimated?: boolean;
  billId?: number | null;
  autoLink?: boolean;
};

export async function listGasReadingsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  return listGasReadingsByHome(homeId);
}

export async function listGasSupplyPointsUseCase(homeId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return [];
  }

  return listGasSupplyPointsByHome(homeId);
}

export async function createGasReadingUseCase(input: GasReadingInput) {
  const { homeId, readingDate, readingM3, notes, supplyPointId, isEstimated, billId, autoLink } =
    input;
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  if (!(readingDate instanceof Date) || Number.isNaN(readingDate.getTime())) {
    return null;
  }

  if (typeof readingM3 !== "number" || !Number.isFinite(readingM3) || readingM3 < 0) {
    return null;
  }

  if (supplyPointId != null) {
    const supplyPoint = await getGasSupplyPointById(homeId, supplyPointId);
    if (!supplyPoint) {
      return null;
    }
  }

  let resolvedBillId: number | null = null;
  if (autoLink === false) {
    if (billId != null) {
      const bill = await getGasBillById(homeId, billId);
      if (!bill) {
        return null;
      }
      resolvedBillId = billId;
    }
  } else if (billId != null) {
    const bill = await getGasBillById(homeId, billId);
    if (!bill) {
      return null;
    }
    resolvedBillId = billId;
  } else {
    const bill = await findGasBillForReading(homeId, readingDate);
    resolvedBillId = bill?.id ?? null;
  }

  return createGasReading(homeId, {
    readingDate,
    readingM3,
    notes: notes ?? null,
    supplyPointId: supplyPointId ?? null,
    isEstimated,
    billId: resolvedBillId,
  });
}

export async function updateGasReadingUseCase(readingId: number, input: GasReadingInput) {
  const { homeId, readingDate, readingM3, notes, supplyPointId, isEstimated, billId, autoLink } =
    input;
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return null;
  }

  if (!Number.isInteger(readingId) || readingId <= 0) {
    return null;
  }

  if (!(readingDate instanceof Date) || Number.isNaN(readingDate.getTime())) {
    return null;
  }

  if (typeof readingM3 !== "number" || !Number.isFinite(readingM3) || readingM3 < 0) {
    return null;
  }

  if (supplyPointId != null) {
    const supplyPoint = await getGasSupplyPointById(homeId, supplyPointId);
    if (!supplyPoint) {
      return null;
    }
  }

  let resolvedBillId: number | null = null;
  if (autoLink === false) {
    if (billId != null) {
      const bill = await getGasBillById(homeId, billId);
      if (!bill) {
        return null;
      }
      resolvedBillId = billId;
    }
  } else if (billId != null) {
    const bill = await getGasBillById(homeId, billId);
    if (!bill) {
      return null;
    }
    resolvedBillId = billId;
  } else {
    const bill = await findGasBillForReading(homeId, readingDate);
    resolvedBillId = bill?.id ?? null;
  }

  return updateGasReading(homeId, readingId, {
    readingDate,
    readingM3,
    notes: notes ?? null,
    supplyPointId: supplyPointId ?? null,
    isEstimated,
    billId: resolvedBillId,
  });
}

export async function deleteGasReadingUseCase(homeId: number, readingId: number) {
  if (!Number.isInteger(homeId) || homeId <= 0) {
    return false;
  }

  if (!Number.isInteger(readingId) || readingId <= 0) {
    return false;
  }

  return deleteGasReading(homeId, readingId);
}
