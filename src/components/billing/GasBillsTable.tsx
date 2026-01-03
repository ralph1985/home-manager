"use client";

import BillsTable from "@/components/billing/BillsTable";
import { formatCurrency } from "@/components/billing/billingFormatters";
import ConsumptionChart from "@/components/billing/ConsumptionChart";
import { calculateDailyAverage } from "@/components/billing/dailyAverage";
import { formatCountLabel, type Labels } from "@/infrastructure/ui/labels";

type GasBillRow = {
  id: number;
  providerName?: string | null;
  invoiceNumber?: string | null;
  issueDate: number;
  periodStart?: number | null;
  periodEnd?: number | null;
  totalAmount: string;
  totalAmountValue?: number | null;
  totalToPay?: string | null;
  consumptionLabel?: string | null;
  consumptionKwh?: number | null;
  consumptionM3?: number | null;
  pdfUrl?: string | null;
  href: string;
};

type GasBillsTableProps = {
  labels: Labels;
  title: string;
  emptyMessage: string;
  bills: GasBillRow[];
};

export default function GasBillsTable({ labels, title, emptyMessage, bills }: GasBillsTableProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
        <span className="text-sm text-[color:var(--text-subtle)]">
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
          totalToPay: bill.totalToPay ?? null,
          consumptionLabel: bill.consumptionLabel ?? null,
          consumptionKwh: bill.consumptionKwh ?? null,
          consumptionM3: bill.consumptionM3 ?? null,
          href: bill.href,
          pdfUrl: bill.pdfUrl ?? null,
        }))}
        chart={(rows) => {
          const points = rows
            .map((row) => ({
              x: Number(row.issueDate),
              kwh: row.consumptionKwh ?? null,
              m3: row.consumptionM3 ?? null,
              amount:
                row.totalAmountValue != null
                  ? row.totalAmountValue
                  : Number(row.totalAmount.toString()),
            }))
            .sort((a, b) => a.x - b.x);

          const kwhSeries = points.map((point) => [point.x, point.kwh] as const);
          const m3Series = points.map((point) => [point.x, point.m3] as const);
          const amountSeries = points.map((point) => [point.x, point.amount] as const);

          const series = [
            ...(kwhSeries.some(([, value]) => value != null)
              ? [
                  {
                    name: labels.gas.chartSeriesKwh,
                    data: kwhSeries,
                    type: "column" as const,
                    yAxis: 0,
                    unit: labels.units.kwh,
                  },
                ]
              : []),
            ...(m3Series.some(([, value]) => value != null)
              ? [
                  {
                    name: labels.gas.chartSeriesM3,
                    data: m3Series,
                    type: "line" as const,
                    yAxis: 1,
                    unit: labels.units.m3,
                  },
                ]
              : []),
            ...(amountSeries.some(([, value]) => Number.isFinite(value))
              ? [
                  {
                    name: labels.gas.chartSeriesAmount,
                    data: amountSeries,
                    type: "line" as const,
                    yAxis: 2,
                    unit: labels.units.eur,
                  },
                ]
              : []),
          ];

          const { dailyAverage } = calculateDailyAverage(rows);

          return (
            <div className="mt-6 space-y-4">
              <ConsumptionChart
                title={labels.gas.chartTitle}
                subtitle={labels.gas.chartSubtitle}
                emptyMessage={labels.gas.chartEmpty}
                series={series}
                yAxisTitles={[
                  labels.gas.chartAxisKwh,
                  labels.gas.chartAxisM3,
                  labels.gas.chartAxisAmount,
                ]}
              />
              {dailyAverage != null ? (
                <div className="hm-panel flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
                  <span className="text-[color:var(--text-subtle)]">
                    {labels.gas.dailyAverageLabel}
                  </span>
                  <span className="text-base font-semibold text-[color:var(--text-strong)]">
                    {formatCurrency(dailyAverage)}
                  </span>
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </section>
  );
}
