import type { FuelPriceSearchCriteria, FuelPriceSearchResult } from "@/domain/FuelPrice";
import type {
  FuelPriceRepository,
  FuelPriceSearchResponse,
} from "@/interfaces/fuelPriceRepository";
import { unstable_cache } from "next/cache";

const fuelPriceApiUrl = "https://geoportalgasolineras.es/geoportal/rest/busquedaEstaciones";
const fuelPricesCacheSeconds = 60 * 60 * 24;
const fuelPricesCacheResetHour = 8;

type FuelPriceSearchPayload = {
  tipoEstacion: string;
  idProvincia: string;
  idMunicipio: string;
  idProducto: string;
  rotulo: string;
  eessEconomicas: boolean;
  conPlanesDescuento: boolean;
  horarioInicial: string;
  horarioFinal: string;
  calle: string;
  numero: string;
  codPostal: string;
  tipoVenta: string;
  tipoServicio: string | null;
  idOperador: string;
  nombrePlan: string;
  idTipoDestinatario: string | null;
  x0: string;
  y0: string;
  x1: string;
  y1: string;
};

function buildSearchPayload(criteria: FuelPriceSearchCriteria): FuelPriceSearchPayload {
  const bounds = criteria.bounds ?? {};

  return {
    tipoEstacion: criteria.stationType ?? "EESS",
    idProvincia: criteria.provinceId ?? "",
    idMunicipio: criteria.municipalityId ?? "",
    idProducto: criteria.productId ?? "4",
    rotulo: criteria.brand ?? "",
    eessEconomicas: criteria.economicalStations ?? false,
    conPlanesDescuento: criteria.discountPlans ?? false,
    horarioInicial: criteria.startTime ?? "",
    horarioFinal: criteria.endTime ?? "",
    calle: criteria.street ?? "",
    numero: criteria.streetNumber ?? "",
    codPostal: criteria.postalCode ?? "28880",
    tipoVenta: criteria.saleType ?? "P",
    tipoServicio: criteria.serviceType ?? null,
    idOperador: criteria.operatorId ?? "",
    nombrePlan: criteria.planName ?? "",
    idTipoDestinatario: criteria.recipientTypeId ?? null,
    x0: bounds.x0 ?? "",
    y0: bounds.y0 ?? "",
    x1: bounds.x1 ?? "",
    y1: bounds.y1 ?? "",
  };
}

async function fetchFuelPrices(payload: FuelPriceSearchPayload): Promise<FuelPriceSearchResult> {
  const response = await fetch(fuelPriceApiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json; charset=UTF-8",
      Origin: "https://geoportalgasolineras.es",
      Referer: "https://geoportalgasolineras.es/geoportal-instalaciones/Inicio",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Fuel prices request failed with status ${response.status}`);
  }

  return (await response.json()) as FuelPriceSearchResult;
}

function getFuelPricesCacheBucket() {
  const now = new Date();
  const cacheDate = new Date(now);

  if (now.getHours() < fuelPricesCacheResetHour) {
    cacheDate.setDate(cacheDate.getDate() - 1);
  }

  const year = cacheDate.getFullYear();
  const month = String(cacheDate.getMonth() + 1).padStart(2, "0");
  const day = String(cacheDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export class FuelPriceRepositoryImpl implements FuelPriceRepository {
  async searchStations(criteria: FuelPriceSearchCriteria): Promise<FuelPriceSearchResponse> {
    try {
      const payload = buildSearchPayload(criteria);
      const cacheBucket = getFuelPricesCacheBucket();
      const cachedFetchFuelPrices = unstable_cache(
        async () => fetchFuelPrices(payload),
        ["fuel-prices", cacheBucket, JSON.stringify(payload)],
        { revalidate: fuelPricesCacheSeconds }
      );
      const result = await cachedFetchFuelPrices();

      return { result, status: "ready" };
    } catch {
      return { result: null, status: "error" };
    }
  }
}
