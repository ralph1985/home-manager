"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

type ChartSeries = {
  name: string;
  data: Array<readonly [number, number | null]>;
  type: "column" | "line";
  yAxis: number;
  unit: string;
};

type GasConsumptionChartProps = {
  title: string;
  subtitle?: string;
  emptyMessage: string;
  series: ChartSeries[];
  yAxisTitles: string[];
};

export default function GasConsumptionChart({
  title,
  subtitle,
  emptyMessage,
  series,
  yAxisTitles,
}: GasConsumptionChartProps) {
  const hasData = series.some((serie) => serie.data.some((point) => point[1] != null));

  if (!hasData) {
    return (
      <section className="mt-12">
        <div className="hm-panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: "transparent",
      spacingTop: 24,
    },
    title: {
      text: title,
      align: "left",
      style: { fontSize: "20px", fontWeight: "600", color: "#0f172a" },
    },
    subtitle: subtitle
      ? {
          text: subtitle,
          align: "left",
          style: { fontSize: "12px", color: "#64748b" },
        }
      : undefined,
    xAxis: {
      type: "datetime",
      tickPixelInterval: 120,
      labels: { style: { color: "#64748b" } },
    },
    yAxis: yAxisTitles.map((title, index) => ({
      title: { text: title, style: { color: "#0f172a" } },
      labels: { style: { color: "#64748b" } },
      opposite: index > 0,
      offset: index === 2 ? 60 : undefined,
    })),
    legend: {
      align: "left",
      verticalAlign: "top",
      itemStyle: { color: "#0f172a", fontWeight: "600" },
    },
    tooltip: {
      shared: true,
      xDateFormat: "%b %Y",
    },
    plotOptions: {
      column: {
        borderRadius: 8,
        pointPadding: 0.15,
      },
    },
    credits: { enabled: false },
    series: series.map((serie) => ({
      type: serie.type,
      name: serie.name,
      data: serie.data,
      yAxis: serie.yAxis,
      tooltip: { valueSuffix: ` ${serie.unit}` },
    })),
  };

  return (
    <section className="mt-12">
      <div className="hm-panel p-6">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </section>
  );
}
