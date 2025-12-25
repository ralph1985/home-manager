"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCurrency, type NumericValue } from "@/components/billing/billingFormatters";
import TableShell from "@/components/TableShell";
import FilterSelect from "@/components/tables/FilterSelect";
import PillTag from "@/components/tables/PillTag";
import SortButton from "@/components/tables/SortButton";
import { compareValues, formatMonthYear, parseDate } from "@/components/tables/tableUtils";
import { parseMaintenanceDescription } from "@/components/vehicles/maintenanceDescription";
import type { Labels } from "@/infrastructure/ui/labels";

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
  labels: Labels;
};

const kmFormatter = new Intl.NumberFormat("es-ES");
export default function MaintenanceTable({ rows, emptyMessage, labels }: MaintenanceTableProps) {
  const sortLabels: Record<SortKey, string> = labels.maintenanceTable.sortLabels;

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

  return (
    <TableShell
      emptyMessage={emptyMessage}
      totalCount={rows.length}
      filteredCount={filteredRows.length}
      labels={labels}
      filters={
        <>
          <FilterSelect
            label={labels.maintenanceTable.filters.workshop}
            value={workshopFilter}
            onChange={setWorkshopFilter}
            options={[
              { value: "all", label: labels.maintenanceTable.filters.all },
              ...workshopOptions.map((workshop) => ({ value: workshop, label: workshop })),
            ]}
          />
          <FilterSelect
            label={labels.maintenanceTable.filters.year}
            value={yearFilter}
            onChange={setYearFilter}
            options={[
              { value: "all", label: labels.maintenanceTable.filters.all },
              ...yearOptions.map((year) => ({ value: year.toString(), label: year.toString() })),
            ]}
          />
        </>
      }
    >
      {sortedRows.length === 0 ? null : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-[720px] w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <SortButton
                    label={sortLabels.date}
                    isActive={sortKey === "date"}
                    direction={sortDirection}
                    onClick={() => toggleSort("date")}
                  />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <SortButton
                    label={sortLabels.title}
                    isActive={sortKey === "title"}
                    direction={sortDirection}
                    onClick={() => toggleSort("title")}
                  />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <SortButton
                    label={sortLabels.workshop}
                    isActive={sortKey === "workshop"}
                    direction={sortDirection}
                    onClick={() => toggleSort("workshop")}
                  />
                </th>
                <th className="px-4 py-3 font-semibold">
                  {labels.maintenanceTable.headers.summary}
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <div className="ml-auto flex">
                    <SortButton
                      label={sortLabels.cost}
                      isActive={sortKey === "cost"}
                      direction={sortDirection}
                      onClick={() => toggleSort("cost")}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <div className="ml-auto flex">
                    <SortButton
                      label={sortLabels.odometer}
                      isActive={sortKey === "odometer"}
                      direction={sortDirection}
                      onClick={() => toggleSort("odometer")}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  {labels.maintenanceTable.headers.detail}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((maintenance) => {
                const details = parseMaintenanceDescription(maintenance.description);
                const jobLabel =
                  details.jobs.length > 0
                    ? `${labels.maintenanceTable.summary.jobPrefix}: ${details.jobs[0]}${
                        details.jobs.length > 1 ? ` +${details.jobs.length - 1}` : ""
                      }`
                    : null;
                const partsLabel =
                  !jobLabel && details.parts.length > 0
                    ? `${labels.maintenanceTable.summary.partsPrefix}: ${details.parts.length}`
                    : null;
                const totalsLabel =
                  !jobLabel && !partsLabel && details.totals.length > 0
                    ? labels.maintenanceTable.summary.totals
                    : null;
                const summaryLabel =
                  jobLabel ?? partsLabel ?? totalsLabel ?? labels.common.emptyValue;

                return (
                  <tr key={maintenance.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-600">
                      {formatMonthYear(maintenance.serviceDate)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{maintenance.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {maintenance.workshopName ? (
                        <PillTag label={maintenance.workshopName} />
                      ) : (
                        labels.common.emptyValue
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{summaryLabel}</td>
                    <td className="px-4 py-3 text-right text-lg font-semibold text-slate-900">
                      {maintenance.cost != null
                        ? formatCurrency(maintenance.cost)
                        : labels.common.emptyValue}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {maintenance.odometerKm != null
                        ? `${kmFormatter.format(maintenance.odometerKm)} ${labels.units.km}`
                        : labels.common.emptyValue}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="hm-pill hm-shadow-soft bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                        href={maintenance.href}
                      >
                        {labels.common.view}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TableShell>
  );
}
