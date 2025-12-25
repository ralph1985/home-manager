"use client";

import BillsTable from "@/components/billing/BillsTable";
import ConsumptionChart from "@/components/billing/ConsumptionChart";
import { formatCountLabel, type Labels } from "@/infrastructure/ui/labels";

type EnergyBillRow = {
  id: number;
  providerName?: string | null;
  invoiceNumber?: string | null;
  issueDate: number;
  periodStart?: number | null;
  periodEnd?: number | null;
  totalAmount: string;
  totalAmountValue?: number | null;
  consumptionLabel?: string | null;
  consumptionKwh?: number | null;
  pdfUrl?: string | null;
  href: string;
};

type EnergyBillsTableProps = {
  labels: Labels;
  title: string;
  emptyMessage: string;
  bills: EnergyBillRow[];
};

export default function EnergyBillsTable({
  labels,
  title,
  emptyMessage,
  bills,
}: EnergyBillsTableProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">
          {formatCountLabel(bills.length, labels.bills.countLabel)}
        </span>
      </div>
      <BillsTable
        emptyMessage={emptyMessage}
        labels={labels}
        rows={bills.map((bill) => ({
          id: bill.id,
          providerName: bill.providerName,
          invoiceNumber: bill.invoiceNumber,
          issueDate: bill.issueDate,
          periodStart: bill.periodStart ?? null,
          periodEnd: bill.periodEnd ?? null,
          totalAmount: bill.totalAmount,
          totalAmountValue: bill.totalAmountValue ?? null,
          consumptionLabel: bill.consumptionLabel ?? null,
          consumptionKwh: bill.consumptionKwh ?? null,
          href: bill.href,
          pdfUrl: bill.pdfUrl ?? null,
        }))}
        chart={(rows) => {
          const points = rows
            .map((row) => ({
              x: Number(row.issueDate),
              kwh: row.consumptionKwh ?? null,
              amount:
                row.totalAmountValue != null
                  ? row.totalAmountValue
                  : Number(row.totalAmount.toString()),
            }))
            .sort((a, b) => a.x - b.x);

          const kwhSeries = points.map((point) => [point.x, point.kwh] as const);
          const amountSeries = points.map((point) => [point.x, point.amount] as const);

          const series = [
            ...(kwhSeries.some(([, value]) => value != null)
              ? [
                  {
                    name: labels.energy.chartSeriesKwh,
                    data: kwhSeries,
                    type: "column" as const,
                    yAxis: 0,
                    unit: labels.units.kwh,
                  },
                ]
              : []),
            ...(amountSeries.some(([, value]) => Number.isFinite(value))
              ? [
                  {
                    name: labels.energy.chartSeriesAmount,
                    data: amountSeries,
                    type: "line" as const,
                    yAxis: 1,
                    unit: labels.units.eur,
                  },
                ]
              : []),
          ];

          return (
            <ConsumptionChart
              title={labels.energy.chartTitle}
              subtitle={labels.energy.chartSubtitle}
              emptyMessage={labels.energy.chartEmpty}
              series={series}
              yAxisTitles={[labels.energy.chartAxisKwh, labels.energy.chartAxisAmount]}
            />
          );
        }}
      />
    </section>
  );
}
