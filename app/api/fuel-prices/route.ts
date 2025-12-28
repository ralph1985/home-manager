import { NextResponse } from "next/server";

import type { FuelPriceSearchCriteria } from "@/domain/FuelPrice";
import { listFuelPricesBatchUseCase, listFuelPricesUseCase } from "@/usecases/fuelPrices";

type FuelPriceRequestPayload = FuelPriceSearchCriteria & {
  productIds?: string[];
};

async function readCriteria(request: Request): Promise<FuelPriceRequestPayload> {
  try {
    return (await request.json()) as FuelPriceRequestPayload;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const payload = await readCriteria(request);
  const { productIds, ...criteria } = payload;
  const response =
    productIds && productIds.length > 0
      ? await listFuelPricesBatchUseCase(criteria, productIds)
      : await listFuelPricesUseCase(criteria);

  if (response.status === "error") {
    return NextResponse.json(response, { status: 502 });
  }

  return NextResponse.json(response);
}
