"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@/components/Button";
import type { FuelPriceSearchResponse } from "@/interfaces/fuelPriceRepository";
import { fuelProductCatalog, type FuelProductId } from "@/infrastructure/fuelCatalog";
import { formatCountLabel, type Labels } from "@/infrastructure/ui/labels";

type FuelPricesSectionProps = {
  labels: Labels["fuelPrices"];
  initialPostalCode: string;
  initialProductIds: string[];
  initialResponse: FuelPriceSearchResponse;
};

const postalCodePattern = /^\d{5}$/;
const fuelSelectionStorageKey = "homeManager:fuelSelection";
const fuelFavoritesStorageKey = "homeManager:fuelFavorites";

type FuelFavorite = {
  id: string;
  name: string;
  postalCode: string;
};

function formatPrice(value: number | null, priceUnit: string) {
  if (value == null) return null;
  return `${value.toFixed(3)} ${priceUnit}`;
}

function formatUpdateLabel(
  baseLabel: string,
  dateValue?: string | null,
  timeValue?: string | null
) {
  const parts = [dateValue, timeValue].filter(Boolean);
  if (parts.length === 0) return null;
  return `${baseLabel} ${parts.join(" ")}`;
}

function buildMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function FuelPricesSection({
  labels,
  initialPostalCode,
  initialProductIds,
  initialResponse,
}: FuelPricesSectionProps) {
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialProductIds);
  const [response, setResponse] = useState<FuelPriceSearchResponse>(initialResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [favorites, setFavorites] = useState<FuelFavorite[]>([]);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const [favoriteName, setFavoriteName] = useState("");
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const stations = useMemo(() => response.result?.estaciones ?? [], [response.result]);
  const stationsCount = stations.length;
  const fuelOptions = useMemo(
    () =>
      fuelProductCatalog.map((item) => ({
        id: item.id,
        label: labels.fuels[item.labelKey as keyof typeof labels.fuels],
      })),
    [labels]
  );
  const fuelLabelById = useMemo(
    () => new Map<FuelProductId, string>(fuelOptions.map((option) => [option.id, option.label])),
    [fuelOptions]
  );
  const fuelBadgeClassNameById = useMemo<Record<FuelProductId, string>>(
    () => ({
      "1": "border-emerald-200 bg-emerald-100 text-emerald-900",
      "3": "border-blue-200 bg-blue-100 text-blue-900",
      "4": "border-slate-900 bg-slate-900 text-white",
      "5": "border-slate-300 bg-slate-200 text-slate-800",
    }),
    []
  );
  const fuelIds = useMemo(() => fuelOptions.map((option) => option.id), [fuelOptions]);
  const fuelIdSet = useMemo(() => new Set<FuelProductId>(fuelIds), [fuelIds]);

  const isFuelProductId = useCallback(
    (value: string): value is FuelProductId => fuelIdSet.has(value as FuelProductId),
    [fuelIdSet]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(fuelSelectionStorageKey);
    if (!stored) return;
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return;
    const sanitized = parsed
      .filter((value): value is string => typeof value === "string")
      .filter(isFuelProductId);
    if (sanitized.length > 0) {
      setSelectedProductIds((current) => {
        const currentKey = current.slice().sort().join(",");
        const nextKey = sanitized.slice().sort().join(",");
        return currentKey === nextKey ? current : sanitized;
      });
    }
    setHasHydrated(true);
  }, [fuelIds, isFuelProductId]);

  useEffect(() => {
    if (!window.localStorage.getItem(fuelSelectionStorageKey)) {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(fuelSelectionStorageKey, JSON.stringify(selectedProductIds));
  }, [selectedProductIds]);

  useEffect(() => {
    const stored = window.localStorage.getItem(fuelFavoritesStorageKey);
    if (!stored) return;
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return;
    const sanitized = parsed.filter(
      (value): value is FuelFavorite =>
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "name" in value &&
        "postalCode" in value &&
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.postalCode === "string"
    );
    setFavorites(sanitized);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(fuelFavoritesStorageKey, JSON.stringify(favorites));
  }, [favorites]);

  const fetchPrices = useCallback(
    async (nextPostalCode: string, productIds: string[]) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const apiResponse = await fetch("/api/fuel-prices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postalCode: nextPostalCode,
            productIds,
          }),
        });

        if (!apiResponse.ok) {
          throw new Error("Fuel prices request failed");
        }

        const data = (await apiResponse.json()) as FuelPriceSearchResponse;
        setResponse(data);
      } catch {
        setResponse({ result: null, status: "error" });
        setErrorMessage(labels.fetchError);
      } finally {
        setIsLoading(false);
      }
    },
    [labels.fetchError]
  );

  useEffect(() => {
    if (!hasHydrated) return;
    if (selectedProductIds.length === 0) {
      setErrorMessage(labels.fuelSelectionInvalid);
      setResponse({ status: "ready", result: null });
      return;
    }
    if (postalCode.length < 5) {
      setErrorMessage(null);
      setResponse({ status: "ready", result: null });
      return;
    }
    if (!postalCodePattern.test(postalCode)) {
      setErrorMessage(labels.postalCodeInvalid);
      setResponse({ status: "ready", result: null });
      return;
    }
    void fetchPrices(postalCode, selectedProductIds);
  }, [
    fetchPrices,
    hasHydrated,
    labels.fuelSelectionInvalid,
    labels.postalCodeInvalid,
    postalCode,
    selectedProductIds,
  ]);

  const formattedStations = useMemo(
    () =>
      [...stations]
        .sort((a, b) => {
          const priceA = a.precio ?? Number.POSITIVE_INFINITY;
          const priceB = b.precio ?? Number.POSITIVE_INFINITY;
          return priceA - priceB;
        })
        .map((station, index) => {
          const info = station.estacion;
          const title = info.rotulo ?? labels.unknownStation;
          const address = [info.direccion, info.municipio, info.provincia]
            .filter(Boolean)
            .join(" · ");
          const mapQuery = [info.direccion, info.municipio, info.provincia]
            .filter(Boolean)
            .join(", ");
          const update = formatUpdateLabel(labels.updatedLabel, info.fechaPvp, info.horaPvp);
          const price = formatPrice(station.precio, labels.priceUnit);
          const fuelLabel =
            station.fuelId && isFuelProductId(station.fuelId)
              ? fuelLabelById.get(station.fuelId)
              : null;
          const fuelBadgeClassName =
            station.fuelId && isFuelProductId(station.fuelId)
              ? fuelBadgeClassNameById[station.fuelId]
              : null;

          const fuelKey = station.fuelId ?? "unknown";
          return {
            key: `${info.id ?? title}-${fuelKey}-${index}`,
            title,
            address: address || labels.addressFallback,
            mapUrl: mapQuery ? buildMapsSearchUrl(mapQuery) : null,
            update,
            price: price ?? labels.priceUnavailable,
            schedule: info.horario,
            fuelLabel,
            fuelBadgeClassName,
          };
        }),
    [fuelBadgeClassNameById, fuelLabelById, labels, stations, isFuelProductId]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPostalCode = postalCode.trim();

    if (!postalCodePattern.test(trimmedPostalCode)) {
      setErrorMessage(labels.postalCodeInvalid);
      return;
    }

    if (selectedProductIds.length === 0) {
      setErrorMessage(labels.fuelSelectionInvalid);
      return;
    }

    void fetchPrices(trimmedPostalCode, selectedProductIds);
  };

  const handleSaveFavorite = () => {
    const trimmedName = favoriteName.trim();
    const trimmedPostalCode = postalCode.trim();

    if (!trimmedName) {
      setFavoriteError(labels.favoriteNameInvalid);
      return;
    }
    if (!postalCodePattern.test(trimmedPostalCode)) {
      setFavoriteError(labels.postalCodeInvalid);
      return;
    }

    setFavorites((current) => [
      ...current,
      {
        id: `${trimmedPostalCode}-${Date.now()}`,
        name: trimmedName,
        postalCode: trimmedPostalCode,
      },
    ]);
    setFavoriteName("");
    setFavoriteError(null);
    setIsFavoriteModalOpen(false);
  };

  const handleOpenFavoriteModal = () => {
    setFavoriteError(null);
    setFavoriteName("");
    setIsFavoriteModalOpen(true);
  };

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">{labels.title}</h2>
        <span className="text-sm text-[color:var(--text-subtle)]">
          {formatCountLabel(stationsCount, labels.countLabel)}
        </span>
      </div>
      <p className="mt-2 text-sm text-[color:var(--text-muted)]">{labels.description}</p>

      <form className="hm-panel mt-6 flex flex-wrap items-end gap-4 p-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
          <span>{labels.postalCodeLabel}</span>
          <input
            className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
            inputMode="numeric"
            maxLength={5}
            value={postalCode}
            placeholder={labels.postalCodePlaceholder}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "").slice(0, 5);
              setPostalCode(nextValue);
            }}
          />
        </label>
        <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
          <span>{labels.fuelLabel}</span>
          <div className="flex flex-wrap gap-3 text-xs text-[color:var(--text-default)]">
            {fuelOptions.map((option) => {
              const isChecked = selectedProductIds.includes(option.id);

              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => {
                      setSelectedProductIds((current) => {
                        if (event.target.checked) {
                          return Array.from(new Set([...current, option.id]));
                        }
                        return current.filter((value) => value !== option.id);
                      });
                    }}
                  />
                  <span className="font-semibold text-[color:var(--text-default)]">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          isLoading={isLoading}
          loadingLabel={labels.loadingAction}
        >
          {labels.searchAction}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          loadingLabel={labels.loadingAction}
          onClick={handleOpenFavoriteModal}
        >
          {labels.favoriteAction}
        </Button>
        <span className="text-xs text-[color:var(--text-faint)]">{labels.postalCodeHelp}</span>
      </form>

      {favorites.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[color:var(--text-subtle)]">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
            {labels.favoriteListLabel}
          </span>
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="flex items-center gap-2 rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs font-semibold text-[color:var(--text-default)]"
            >
              <button type="button" onClick={() => setPostalCode(favorite.postalCode)}>
                {favorite.name} · {favorite.postalCode}
              </button>
              <button
                type="button"
                className="text-[color:var(--text-faint)] hover:text-[color:var(--text-default)]"
                aria-label={labels.favoriteRemoveLabel}
                title={labels.favoriteRemoveLabel}
                onClick={() =>
                  setFavorites((current) => current.filter((item) => item.id !== favorite.id))
                }
              >
                {labels.favoriteRemove}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="hm-panel mt-6 p-6 text-sm text-[color:var(--text-danger, #b91c1c)]">
          {errorMessage}
        </div>
      ) : null}

      {response.status === "error" && !errorMessage ? (
        <div className="hm-panel mt-6 p-6 text-sm text-[color:var(--text-danger, #b91c1c)]">
          {labels.fetchError}
        </div>
      ) : null}

      {response.status === "ready" && formattedStations.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-sm text-[color:var(--text-muted)]">
          {labels.emptyList}
        </div>
      ) : null}

      {formattedStations.length > 0 ? (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {formattedStations.map((station) => (
            <li key={station.key} className="hm-panel flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[color:var(--text-strong)]">
                    {station.title}
                  </div>
                  {station.mapUrl ? (
                    <a
                      className="mt-1 inline-flex text-sm text-[color:var(--text-muted)] underline-offset-4 hover:underline"
                      href={station.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {station.address}
                    </a>
                  ) : (
                    <div className="mt-1 text-sm text-[color:var(--text-muted)]">
                      {station.address}
                    </div>
                  )}
                </div>
                <div className="text-lg font-semibold text-[color:var(--text-strong)]">
                  {station.price}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--text-faint)]">
                {station.fuelLabel ? (
                  <span
                    className={`rounded-full border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${
                      station.fuelBadgeClassName ??
                      "border-[var(--surface-border)] text-[color:var(--text-subtle)]"
                    }`}
                  >
                    {station.fuelLabel}
                  </span>
                ) : null}
                {station.update ? <span>{station.update}</span> : null}
                {station.schedule ? <span>{station.schedule}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {isFavoriteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="hm-panel w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[color:var(--text-strong)]">
                  {labels.favoriteModalTitle}
                </div>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  {labels.favoriteModalDescription}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-[color:var(--text-subtle)]"
                onClick={() => setIsFavoriteModalOpen(false)}
              >
                {labels.favoriteCancel}
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
                <span>{labels.favoriteNameLabel}</span>
                <input
                  className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text-default)]"
                  value={favoriteName}
                  placeholder={labels.favoriteNamePlaceholder}
                  onChange={(event) => setFavoriteName(event.target.value)}
                />
              </label>
              {favoriteError ? (
                <div className="text-xs text-[color:var(--text-danger, #b91c1c)]">
                  {favoriteError}
                </div>
              ) : null}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  loadingLabel={labels.loadingAction}
                  onClick={() => setIsFavoriteModalOpen(false)}
                >
                  {labels.favoriteCancel}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  loadingLabel={labels.loadingAction}
                  onClick={handleSaveFavorite}
                >
                  {labels.favoriteSave}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
