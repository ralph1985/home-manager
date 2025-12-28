import type {
  FuelPriceSearchCriteria,
  FuelPriceSearchResult,
  FuelPriceStation,
} from "@/domain/FuelPrice";
import type { FuelPriceSearchResponse } from "@/interfaces/fuelPriceRepository";
import { FuelPriceRepositoryImpl } from "@/infrastructure/fuelPriceRepository";

const repository = new FuelPriceRepositoryImpl();

export async function listFuelPricesUseCase(
  criteria: FuelPriceSearchCriteria = {}
): Promise<FuelPriceSearchResponse> {
  const response = await repository.searchStations(criteria);
  if (response.status !== "ready" || !response.result) {
    return response;
  }

  const fuelId = criteria.productId ?? null;
  if (!fuelId) return response;

  return {
    ...response,
    result: {
      ...response.result,
      estaciones: response.result.estaciones.map((station) => ({
        ...station,
        fuelId,
      })),
    },
  };
}

function mergeBoundingBoxes(results: FuelPriceSearchResult[]) {
  if (results.length === 0) return null;

  const initial = results[0].bbox;
  return results.reduce(
    (bbox, result) => ({
      x0: Math.min(bbox.x0, result.bbox.x0),
      y0: Math.min(bbox.y0, result.bbox.y0),
      x1: Math.max(bbox.x1, result.bbox.x1),
      y1: Math.max(bbox.y1, result.bbox.y1),
      initialized: true,
      latitudeSeparation: Math.max(bbox.latitudeSeparation, result.bbox.latitudeSeparation),
    }),
    { ...initial }
  );
}

export async function listFuelPricesBatchUseCase(
  criteria: FuelPriceSearchCriteria,
  productIds: string[]
): Promise<FuelPriceSearchResponse> {
  const normalizedProductIds = productIds.filter((value) => value.trim().length > 0);
  if (normalizedProductIds.length === 0) {
    return { result: null, status: "error" };
  }

  const responses = await Promise.all(
    normalizedProductIds.map(async (productId) => ({
      productId,
      response: await repository.searchStations({ ...criteria, productId }),
    }))
  );

  const successful = responses.filter(
    ({ response }) => response.status === "ready" && response.result
  );
  if (successful.length === 0) {
    return { result: null, status: "error" };
  }

  const results = successful.map(({ response, productId }) => {
    const result = response.result as FuelPriceSearchResult;
    const fuelId = productId ?? null;

    return {
      ...result,
      estaciones: result.estaciones.map<FuelPriceStation>((station) => ({
        ...station,
        fuelId,
      })),
    };
  });

  const mergedStations = results.flatMap((result) => result.estaciones);
  const mergedBBox = mergeBoundingBoxes(results);

  return {
    status: "ready",
    result: {
      bbox: mergedBBox ?? results[0].bbox,
      estaciones: mergedStations,
    },
  };
}
