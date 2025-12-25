"use client";

import BillsTable from "@/components/billing/BillsTable";
import ConsumptionChart from "@/components/billing/ConsumptionChart";
import { formatCountLabel, type Labels } from "@/infrastructure/ui/labels";

type WaterBillRow = {
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
  consumptionM3?: number | null;
  billType?: string | null;
  cancelsInvoiceNumber?: string | null;
  cancelsHref?: string | null;
  pdfUrl?: string | null;
  href: string;
};

type WaterBillsTableProps = {
  labels: Labels;
  title: string;
  emptyMessage: string;
  bills: WaterBillRow[];
};

export default function WaterBillsTable({
  labels,
  title,
  emptyMessage,
  bills,
}: WaterBillsTableProps) {
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
          totalToPay: bill.totalToPay ?? null,
          consumptionLabel: bill.consumptionLabel ?? null,
          consumptionM3: bill.consumptionM3 ?? null,
          billType: bill.billType ?? null,
          cancelsInvoiceNumber: bill.cancelsInvoiceNumber ?? null,
          cancelsHref: bill.cancelsHref ?? null,
          href: bill.href,
          pdfUrl: bill.pdfUrl ?? null,
        }))}
        chart={(rows) => {
          const points = rows
            .map((row) => ({
              x: Number(row.issueDate),
              m3: row.consumptionM3 ?? null,
              amount:
                row.totalAmountValue != null
                  ? row.totalAmountValue
                  : Number(row.totalAmount.toString()),
            }))
            .sort((a, b) => a.x - b.x);

          const m3Series = points.map((point) => [point.x, point.m3] as const);
          const amountSeries = points.map((point) => [point.x, point.amount] as const);

          const series = [
            ...(m3Series.some(([, value]) => value != null)
              ? [
                  {
                    name: labels.water.chartSeriesM3,
                    data: m3Series,
                    type: "column" as const,
                    yAxis: 0,
                    unit: labels.units.m3,
                  },
                ]
              : []),
            ...(amountSeries.some(([, value]) => Number.isFinite(value))
              ? [
                  {
                    name: labels.water.chartSeriesAmount,
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
              title={labels.water.chartTitle}
              subtitle={labels.water.chartSubtitle}
              emptyMessage={labels.water.chartEmpty}
              series={series}
              yAxisTitles={[labels.water.chartAxisM3, labels.water.chartAxisAmount]}
            />
          );
        }}
      />
    </section>
  );
}
