import Link from "next/link";

import { formatCurrency } from "@/components/billing/billingFormatters";
import YearComparisonChart from "@/components/billing/YearComparisonChart";
import type { Labels } from "@/infrastructure/ui/labels";
import type { YearComparison, YearComparisonBillRef } from "@/usecases/billComparisons";

type ComparisonSectionCopy = {
  title: string;
  description: string;
  empty: string;
  deltaLabel: string;
  chartTitle: string;
  chartSubtitle?: string;
  chartMetricLabel: string;
  chartMetricAmount: string;
  chartMetricUsage: string;
  chartAxisAmount: string;
  chartAxisUsage: string;
  columns: {
    month: string;
    amount: string;
    usage: string;
    eurPerUnit: string;
    bill: string;
    deltaAmount: string;
    deltaUsage: string;
  };
};

type YearComparisonSectionProps = {
  labels: Labels;
  comparison: YearComparison | null;
  billPathPrefix: string;
  usageUnit: string;
  copy: ComparisonSectionCopy;
};

const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "short" });

function formatMonthLabel(month: number) {
  return monthFormatter.format(new Date(Date.UTC(2020, month - 1, 1)));
}

function formatMetric(value: number | null, unit: string, labels: Labels, digits = 1) {
  if (value == null) return labels.common.emptyValue;
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: digits })} ${unit}`;
}

function formatEurPerUnit(value: number | null, labels: Labels, usageUnit: string) {
  if (value == null) return labels.common.emptyValue;
  const unit = `${labels.units.eur}/${usageUnit}`;
  return `${value.toFixed(3)} ${unit}`;
}

function deltaClass(value: number | null) {
  if (value == null) return "text-slate-500";
  if (value > 0) return "text-rose-600";
  if (value < 0) return "text-emerald-600";
  return "text-slate-500";
}

function renderBillLinks(bills: YearComparisonBillRef[], billPathPrefix: string, labels: Labels) {
  if (bills.length === 0) return labels.common.emptyValue;
  return (
    <div className="flex flex-wrap gap-2">
      {bills.map((bill) => (
        <Link
          key={bill.id}
          className="hm-pill border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          href={`${billPathPrefix}/${bill.id}`}
        >
          {bill.invoiceNumber ? bill.invoiceNumber : labels.common.view}
        </Link>
      ))}
    </div>
  );
}

export default function YearComparisonSection({
  labels,
  comparison,
  billPathPrefix,
  usageUnit,
  copy,
}: YearComparisonSectionProps) {
  if (!comparison) {
    return (
      <section className="mt-12">
        <div className="hm-panel p-6 text-slate-600">{copy.empty}</div>
      </section>
    );
  }

  const { yearA, yearB, months, summary } = comparison;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {copy.title} {yearA} vs {yearB}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="hm-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{yearA}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(summary.yearA.amount)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {formatMetric(summary.yearA.usage, usageUnit, labels, 1)}
          </p>
          <p className="text-xs text-slate-400">
            {formatEurPerUnit(summary.yearA.eurPerUnit, labels, usageUnit)}
          </p>
        </div>
        <div className="hm-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{yearB}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(summary.yearB.amount)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {formatMetric(summary.yearB.usage, usageUnit, labels, 1)}
          </p>
          <p className="text-xs text-slate-400">
            {formatEurPerUnit(summary.yearB.eurPerUnit, labels, usageUnit)}
          </p>
        </div>
        <div className="hm-panel p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{copy.deltaLabel}</p>
          <p className={`mt-2 text-2xl font-semibold ${deltaClass(summary.deltaAmount)}`}>
            {summary.deltaAmount != null
              ? formatCurrency(summary.deltaAmount)
              : labels.common.emptyValue}
          </p>
          <p className={`mt-2 text-sm ${deltaClass(summary.deltaUsage)}`}>
            {summary.deltaUsage != null
              ? formatMetric(summary.deltaUsage, usageUnit, labels, 1)
              : labels.common.emptyValue}
          </p>
        </div>
      </div>

      <YearComparisonChart
        comparison={comparison}
        copy={{
          title: copy.chartTitle,
          subtitle: copy.chartSubtitle,
          metricLabel: copy.chartMetricLabel,
          metricAmount: copy.chartMetricAmount,
          metricUsage: copy.chartMetricUsage,
          axisAmount: copy.chartAxisAmount,
          axisUsage: copy.chartAxisUsage,
        }}
        units={{ amount: labels.units.eur, usage: usageUnit }}
      />

      <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="min-w-[980px] w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">{copy.columns.month}</th>
              <th className="px-4 py-3 font-semibold">{`${copy.columns.amount} ${yearA}`}</th>
              <th className="px-4 py-3 font-semibold">{`${copy.columns.usage} ${yearA}`}</th>
              <th className="px-4 py-3 font-semibold">{copy.columns.eurPerUnit}</th>
              <th className="px-4 py-3 font-semibold">{`${copy.columns.bill} ${yearA}`}</th>
              <th className="px-4 py-3 font-semibold">{`${copy.columns.amount} ${yearB}`}</th>
              <th className="px-4 py-3 font-semibold">{`${copy.columns.usage} ${yearB}`}</th>
              <th className="px-4 py-3 font-semibold">{copy.columns.eurPerUnit}</th>
              <th className="px-4 py-3 font-semibold">{`${copy.columns.bill} ${yearB}`}</th>
              <th className="px-4 py-3 font-semibold">{copy.columns.deltaAmount}</th>
              <th className="px-4 py-3 font-semibold">{copy.columns.deltaUsage}</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.month} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-600">
                  {formatMonthLabel(month.month)}
                </td>
                <td className="px-4 py-3 text-slate-900">
                  {month.yearA ? formatCurrency(month.yearA.amount) : labels.common.emptyValue}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {month.yearA
                    ? formatMetric(month.yearA.usage, usageUnit, labels, 1)
                    : labels.common.emptyValue}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {month.yearA
                    ? formatEurPerUnit(month.yearA.eurPerUnit, labels, usageUnit)
                    : labels.common.emptyValue}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {renderBillLinks(month.billsA, billPathPrefix, labels)}
                </td>
                <td className="px-4 py-3 text-slate-900">
                  {month.yearB ? formatCurrency(month.yearB.amount) : labels.common.emptyValue}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {month.yearB
                    ? formatMetric(month.yearB.usage, usageUnit, labels, 1)
                    : labels.common.emptyValue}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {month.yearB
                    ? formatEurPerUnit(month.yearB.eurPerUnit, labels, usageUnit)
                    : labels.common.emptyValue}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {renderBillLinks(month.billsB, billPathPrefix, labels)}
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${deltaClass(month.deltaAmount)}`}>
                  {month.deltaAmount != null
                    ? formatCurrency(month.deltaAmount)
                    : labels.common.emptyValue}
                </td>
                <td className={`px-4 py-3 text-sm ${deltaClass(month.deltaUsage)}`}>
                  {month.deltaUsage != null
                    ? formatMetric(month.deltaUsage, usageUnit, labels, 1)
                    : labels.common.emptyValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
