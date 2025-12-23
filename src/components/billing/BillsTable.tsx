"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";

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

const monthYearFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "numeric",
});

const providerColorTokens = [
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
  invoice: "Factura",
  provider: "Proveedor",
  total: "Total",
  consumption: "Consumo",
};

function parseDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value);
}

function formatMonthYear(value: Date | string | number) {
  return monthYearFormatter.format(parseDate(value));
}

function hashProvider(value: string) {
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
          <span className="font-semibold uppercase tracking-[0.2em]">Proveedor</span>
          <select
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
          >
            <option value="all">Todos</option>
            {providerOptions.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
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
          <table className="min-w-[820px] w-full text-left text-sm text-slate-700">
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
                    onClick={() => toggleSort("invoice")}
                  >
                    {sortLabels.invoice} <span>{sortIndicator("invoice")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    className="flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("provider")}
                  >
                    {sortLabels.provider} <span>{sortIndicator("provider")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    className="ml-auto flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("total")}
                  >
                    {sortLabels.total} <span>{sortIndicator("total")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  <button
                    className="ml-auto flex items-center gap-2"
                    type="button"
                    onClick={() => toggleSort("consumption")}
                  >
                    {sortLabels.consumption} <span>{sortIndicator("consumption")}</span>
                  </button>
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
                      {bill.providerName
                        ? (() => {
                            const index =
                              hashProvider(bill.providerName) % providerColorTokens.length;
                            const color = providerColorTokens[index];
                            return (
                              <span
                                className={`inline-flex items-center gap-2 rounded-full ${color.bg} px-3 py-1 text-xs font-semibold ${color.text}`}
                              >
                                <span className="h-2 w-2 rounded-full bg-current" />
                                {bill.providerName}
                              </span>
                            );
                          })()
                        : "-"}
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
    </div>
  );
}
