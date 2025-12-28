import type { FuelPriceSearchCriteria, FuelPriceSearchResult } from "@/domain/FuelPrice";

export type FuelPriceSearchStatus = "ready" | "error";

export type FuelPriceSearchResponse = {
  result: FuelPriceSearchResult | null;
  status: FuelPriceSearchStatus;
};

export interface FuelPriceRepository {
  searchStations(criteria: FuelPriceSearchCriteria): Promise<FuelPriceSearchResponse>;
}
