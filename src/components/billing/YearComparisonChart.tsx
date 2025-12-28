"use client";

import { useMemo, useState } from "react";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import type { YearComparison } from "@/usecases/billComparisons";

type ComparisonChartCopy = {
  title: string;
  subtitle?: string;
  metricLabel: string;
  metricAmount: string;
  metricUsage: string;
  axisAmount: string;
  axisUsage: string;
};

type YearComparisonChartProps = {
  comparison: YearComparison;
  copy: ComparisonChartCopy;
  units: {
    amount: string;
    usage: string;
  };
};

type MetricKey = "amount" | "usage";

const monthFormatter = new Intl.DateTimeFormat("es-ES", { month: "short" });

function buildMonthLabels() {
  return Array.from({ length: 12 }, (_, index) =>
    monthFormatter.format(new Date(Date.UTC(2020, index, 1)))
  );
}

export default function YearComparisonChart({ comparison, copy, units }: YearComparisonChartProps) {
  const [metric, setMetric] = useState<MetricKey>("amount");
  const monthLabels = useMemo(() => buildMonthLabels(), []);

  const seriesData = useMemo(() => {
    const byMonth = [...comparison.months].sort((a, b) => a.month - b.month);
    const valueKey = metric === "amount" ? "amount" : "usage";

    const yearAData = byMonth.map((month) => month.yearA?.[valueKey] ?? null);
    const yearBData = byMonth.map((month) => month.yearB?.[valueKey] ?? null);

    return [
      { name: comparison.yearA.toString(), data: yearAData },
      { name: comparison.yearB.toString(), data: yearBData },
    ];
  }, [comparison, metric]);

  const yAxisTitle = metric === "amount" ? copy.axisAmount : copy.axisUsage;
  const valueSuffix = metric === "amount" ? ` ${units.amount}` : ` ${units.usage}`;

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "transparent",
      spacingTop: 24,
    },
    title: {
      text: copy.title,
      align: "left",
      style: { fontSize: "20px", fontWeight: "600", color: "#0f172a" },
    },
    subtitle: copy.subtitle
      ? {
          text: copy.subtitle,
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
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)]">
            <span>{copy.metricLabel}</span>
            <div className="flex rounded-full border border-[var(--surface-border)] bg-[var(--surface)]">
              {(["amount", "usage"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    metric === key
                      ? "rounded-full bg-slate-900 text-white"
                      : "text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
                  }`}
                  onClick={() => setMetric(key)}
                >
                  {key === "amount" ? copy.metricAmount : copy.metricUsage}
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
