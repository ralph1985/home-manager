"use client";

import { useMemo, useState } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import type { EnergyComparison } from "@/usecases/energyComparison";
import type { Labels } from "@/infrastructure/ui/labels";

type MetricKey = "amount" | "kwh";

type EnergyComparisonChartProps = {
  labels: Labels;
  comparison: EnergyComparison;
};

const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "short" });

function buildMonthLabels() {
  return Array.from({ length: 12 }, (_, index) =>
    monthFormatter.format(new Date(Date.UTC(2020, index, 1)))
  );
}

export default function EnergyComparisonChart({
  labels,
  comparison,
}: EnergyComparisonChartProps) {
  const [metric, setMetric] = useState<MetricKey>("amount");

  const monthLabels = useMemo(() => buildMonthLabels(), []);
  const seriesData = useMemo(() => {
    const byMonth = [...comparison.months].sort((a, b) => a.month - b.month);
    const valueKey = metric === "amount" ? "amount" : "kwh";

    const yearAData = byMonth.map((month) => month.yearA?.[valueKey] ?? null);
    const yearBData = byMonth.map((month) => month.yearB?.[valueKey] ?? null);

    return [
      { name: comparison.yearA.toString(), data: yearAData },
      { name: comparison.yearB.toString(), data: yearBData },
    ];
  }, [comparison, metric]);

  const yAxisTitle =
    metric === "amount"
      ? labels.energy.comparison.chartAxisAmount
      : labels.energy.comparison.chartAxisKwh;
  const valueSuffix = metric === "amount" ? ` ${labels.units.eur}` : ` ${labels.units.kwh}`;

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "transparent",
      spacingTop: 24,
    },
    title: {
      text: labels.energy.comparison.chartTitle,
      align: "left",
      style: { fontSize: "20px", fontWeight: "600", color: "#0f172a" },
    },
    subtitle: labels.energy.comparison.chartSubtitle
      ? {
          text: labels.energy.comparison.chartSubtitle,
          align: "left",
          style: { fontSize: "12px", color: "#64748b" },
        }
      : undefined,
    xAxis: {
      categories: monthLabels,
      labels: { style: { color: "#64748b" } },
    },
    yAxis: {
      title: { text: yAxisTitle, style: { color: "#0f172a" } },
      labels: { style: { color: "#64748b" } },
    },
    legend: {
      align: "left",
      verticalAlign: "top",
      itemStyle: { color: "#0f172a", fontWeight: "600" },
    },
    tooltip: {
      shared: true,
      valueSuffix,
    },
    plotOptions: {
      series: {
        marker: { radius: 4 },
      },
    },
    credits: { enabled: false },
    series: seriesData.map((serie) => ({
      type: "line",
      name: serie.name,
      data: serie.data,
    })),
  };

  return (
    <section className="mt-6">
      <div className="hm-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>{labels.energy.comparison.chartMetricLabel}</span>
            <div className="flex rounded-full border border-slate-200 bg-white">
              {(["amount", "kwh"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    metric === key
                      ? "rounded-full bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={() => setMetric(key)}
                >
                  {key === "amount"
                    ? labels.energy.comparison.chartMetricAmount
                    : labels.energy.comparison.chartMetricKwh}
                </button>
              ))}
            </div>
          </div>
        </div>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </section>
  );
}
