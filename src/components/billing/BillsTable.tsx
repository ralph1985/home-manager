"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";
import TableShell from "@/components/TableShell";
import FilterSelect from "@/components/tables/FilterSelect";
import PillTag from "@/components/tables/PillTag";
import SortButton from "@/components/tables/SortButton";
import { compareValues, formatMonthYear, parseDate } from "@/components/tables/tableUtils";

type BillRow = {
  id: number;
  providerName?: string | null;
  invoiceNumber?: string | null;
  issueDate: Date | string | number;
  periodStart?: Date | string | number | null;
  periodEnd?: Date | string | number | null;
  totalAmount: NumericValue;
  consumptionLabel?: string | null;
  href: string;
};

type SortKey = "date" | "invoice" | "provider" | "total" | "consumption";

type BillsTableProps = {
  rows: BillRow[];
  emptyMessage: string;
};

const sortLabels: Record<SortKey, string> = {
  date: "Fecha",
  invoice: "Factura",
  provider: "Proveedor",
  total: "Total",
  consumption: "Consumo",
};

function parseConsumption(label?: string | null) {
  if (!label) return null;
  const match = label.replace(",", ".").match(/-?\\d+(?:\\.\\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isNaN(value) ? null : value;
}

export default function BillsTable({ rows, emptyMessage }: BillsTableProps) {
  const [providerFilter, setProviderFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const providerOptions = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      if (row.providerName) {
        unique.add(row.providerName);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "es-ES"));
  }, [rows]);

  const yearOptions = useMemo(() => {
    const unique = new Set<number>();
    rows.forEach((row) => {
      const year = parseDate(row.issueDate).getFullYear();
      if (!Number.isNaN(year)) {
        unique.add(year);
      }
    });
    return Array.from(unique).sort((a, b) => b - a);
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesProvider = providerFilter === "all" || row.providerName === providerFilter;
      const year = parseDate(row.issueDate).getFullYear().toString();
      const matchesYear = yearFilter === "all" || year === yearFilter;
      return matchesProvider && matchesYear;
    });
  }, [rows, providerFilter, yearFilter]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      let valueA: string | number | null = null;
      let valueB: string | number | null = null;

      switch (sortKey) {
        case "date":
          valueA = parseDate(a.issueDate).getTime();
          valueB = parseDate(b.issueDate).getTime();
          break;
        case "invoice":
          valueA = a.invoiceNumber ?? null;
          valueB = b.invoiceNumber ?? null;
          break;
        case "provider":
          valueA = a.providerName ?? null;
          valueB = b.providerName ?? null;
          break;
        case "total":
          valueA = Number(a.totalAmount.toString());
          valueB = Number(b.totalAmount.toString());
          break;
        case "consumption":
          valueA = parseConsumption(a.consumptionLabel);
          valueB = parseConsumption(b.consumptionLabel);
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
      filters={
        <>
          <FilterSelect
            label="Proveedor"
            value={providerFilter}
            onChange={setProviderFilter}
            options={[
              { value: "all", label: "Todos" },
              ...providerOptions.map((provider) => ({ value: provider, label: provider })),
            ]}
          />
          <FilterSelect
            label="Ano"
            value={yearFilter}
            onChange={setYearFilter}
            options={[
              { value: "all", label: "Todos" },
              ...yearOptions.map((year) => ({ value: year.toString(), label: year.toString() })),
            ]}
          />
        </>
      }
    >
      {sortedRows.length === 0 ? null : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-[820px] w-full text-left text-sm text-slate-700">
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
                    label={sortLabels.invoice}
                    isActive={sortKey === "invoice"}
                    direction={sortDirection}
                    onClick={() => toggleSort("invoice")}
                  />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <SortButton
                    label={sortLabels.provider}
                    isActive={sortKey === "provider"}
                    direction={sortDirection}
                    onClick={() => toggleSort("provider")}
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 text-right font-semibold">
                  <div className="ml-auto flex">
                    <SortButton
                      label={sortLabels.total}
                      isActive={sortKey === "total"}
                      direction={sortDirection}
                      onClick={() => toggleSort("total")}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <div className="ml-auto flex">
                    <SortButton
                      label={sortLabels.consumption}
                      isActive={sortKey === "consumption"}
                      direction={sortDirection}
                      onClick={() => toggleSort("consumption")}
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((bill) => {
                const periodLabel =
                  bill.periodStart && bill.periodEnd
                    ? `${formatDate(parseDate(bill.periodStart))} - ${formatDate(parseDate(bill.periodEnd))}`
                    : formatDate(parseDate(bill.issueDate));

                return (
                  <tr key={bill.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-600">
                      {formatMonthYear(bill.issueDate)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {bill.invoiceNumber ?? "Factura"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {bill.providerName ? <PillTag label={bill.providerName} /> : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{periodLabel}</td>
                    <td className="px-4 py-3 text-right text-lg font-semibold text-slate-900">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {bill.consumptionLabel ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        className="hm-pill hm-shadow-soft bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                        href={bill.href}
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
    </TableShell>
  );
}
