"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCurrency, type NumericValue } from "@/components/billing/billingFormatters";
import { parseMaintenanceDescription } from "@/components/vehicles/maintenanceDescription";

type MaintenanceRow = {
  id: number;
  title: string;
  serviceDate: Date | string;
  odometerKm?: number | null;
  cost?: NumericValue | null;
  workshopName?: string | null;
  description?: string | null;
  href: string;
};

type SortKey = "date" | "title" | "workshop" | "cost" | "odometer";

type MaintenanceTableProps = {
  rows: MaintenanceRow[];
  emptyMessage: string;
};

const kmFormatter = new Intl.NumberFormat("es-ES");
const monthYearFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "numeric",
});

const workshopColorTokens = [
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-emerald-100", text: "text-emerald-800" },
  { bg: "bg-sky-100", text: "text-sky-800" },
  { bg: "bg-rose-100", text: "text-rose-800" },
  { bg: "bg-lime-100", text: "text-lime-800" },
  { bg: "bg-indigo-100", text: "text-indigo-800" },
  { bg: "bg-orange-100", text: "text-orange-800" },
  { bg: "bg-teal-100", text: "text-teal-800" },
];

const sortLabels: Record<SortKey, string> = {
  date: "Fecha",
  title: "Mantenimiento",
  workshop: "Taller",
  cost: "Coste",
  odometer: "KM",
};

function parseDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function formatMonthYear(value: Date | string) {
  return monthYearFormatter.format(parseDate(value));
}

function hashWorkshop(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

function compareValues(a: string | number | null, b: string | number | null) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return a.toString().localeCompare(b.toString(), "es-ES");
}

export default function MaintenanceTable({ rows, emptyMessage }: MaintenanceTableProps) {
  const [workshopFilter, setWorkshopFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const workshopOptions = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      if (row.workshopName) {
        unique.add(row.workshopName);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "es-ES"));
  }, [rows]);

  const yearOptions = useMemo(() => {
    const unique = new Set<number>();
    rows.forEach((row) => {
      const year = parseDate(row.serviceDate).getFullYear();
      if (!Number.isNaN(year)) {
        unique.add(year);
      }
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesWorkshop = workshopFilter === "all" || row.workshopName === workshopFilter;
      const year = parseDate(row.serviceDate).getFullYear().toString();
      const matchesYear = yearFilter === "all" || year === yearFilter;
      return matchesWorkshop && matchesYear;
    });
  }, [rows, workshopFilter, yearFilter]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let valueA: string | number | null = null;
      let valueB: string | number | null = null;

      switch (sortKey) {
        case "date":
          valueA = parseDate(a.serviceDate).getTime();
          valueB = parseDate(b.serviceDate).getTime();
          break;
        case "title":
          valueA = a.title;
          valueB = b.title;
          break;
        case "workshop":
          valueA = a.workshopName ?? null;
          valueB = b.workshopName ?? null;
          break;
        case "cost":
          valueA = a.cost != null ? Number(a.cost.toString()) : null;
          valueB = b.cost != null ? Number(b.cost.toString()) : null;
          break;
        case "odometer":
          valueA = a.odometerKm ?? null;
          valueB = b.odometerKm ?? null;
          break;
      }

      const result = compareValues(valueA, valueB);
      return sortDirection === "asc" ? result : -result;
    });
    return sorted;
  }, [filteredRows, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return "↕";
    }
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (rows.length === 0) {
    return <div className="hm-panel mt-6 p-6 text-slate-600">{emptyMessage}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold uppercase tracking-[0.2em]">Taller</span>
          <select
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            value={workshopFilter}
            onChange={(event) => setWorkshopFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            {workshopOptions.map((workshop) => (
              <option key={workshop} value={workshop}>
                {workshop}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold uppercase tracking-[0.2em]">Ano</span>
          <select
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            {yearOptions.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-400">
          {filteredRows.length} resultado{filteredRows.length === 1 ? "" : "s"}
        </div>
      </div>

      {sortedRows.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-slate-600">Sin resultados.</div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-[720px] w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("date")}
                  >
                    {sortLabels.date} <span>{sortIndicator("date")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("title")}
                  >
                    {sortLabels.title} <span>{sortIndicator("title")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("workshop")}
                  >
                    {sortLabels.workshop} <span>{sortIndicator("workshop")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Resumen</th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    className="ml-auto flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("cost")}
                  >
                    {sortLabels.cost} <span>{sortIndicator("cost")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    className="ml-auto flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("odometer")}
                  >
                    {sortLabels.odometer} <span>{sortIndicator("odometer")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((maintenance) => {
                const details = parseMaintenanceDescription(maintenance.description);
                const jobLabel =
                  details.jobs.length > 0
                    ? `Trabajo: ${details.jobs[0]}${details.jobs.length > 1 ? ` +${details.jobs.length - 1}` : ""}`
                    : null;
                const partsLabel =
                  !jobLabel && details.parts.length > 0 ? `Piezas: ${details.parts.length}` : null;
                const totalsLabel =
                  !jobLabel && !partsLabel && details.totals.length > 0
                    ? "Importes detallados"
                    : null;
                const summaryLabel = jobLabel ?? partsLabel ?? totalsLabel ?? "-";

                return (
                  <tr key={maintenance.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-600">
                      {formatMonthYear(maintenance.serviceDate)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{maintenance.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {maintenance.workshopName
                        ? (() => {
                            const index =
                              hashWorkshop(maintenance.workshopName) % workshopColorTokens.length;
                            const color = workshopColorTokens[index];
                            return (
                              <span
                                className={`inline-flex items-center gap-2 rounded-full ${color.bg} px-3 py-1 text-xs font-semibold ${color.text}`}
                              >
                                <span className="h-2 w-2 rounded-full bg-current" />
                                {maintenance.workshopName}
                              </span>
                            );
                          })()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{summaryLabel}</td>
                    <td className="px-4 py-3 text-right text-lg font-semibold text-slate-900">
                      {maintenance.cost != null ? formatCurrency(maintenance.cost) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {maintenance.odometerKm != null
                        ? `${kmFormatter.format(maintenance.odometerKm)} km`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="hm-pill hm-shadow-soft bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                        href={maintenance.href}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
