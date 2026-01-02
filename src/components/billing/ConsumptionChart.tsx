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

type ConsumptionChartProps = {
  title: string;
  subtitle?: string;
  emptyMessage: string;
  series: ChartSeries[];
  yAxisTitles: string[];
};

export default function ConsumptionChart({
  title,
  subtitle,
  emptyMessage,
  series,
  yAxisTitles,
}: ConsumptionChartProps) {
  const hasData = series.some((serie) => serie.data.some((point) => point[1] != null));

  if (!hasData) {
    return (
      <section className="mt-6">
        <div className="hm-panel p-6">
          <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[color:var(--text-subtle)]">{subtitle}</p>
          ) : null}
          <p className="mt-4 text-sm text-[color:var(--text-subtle)]">{emptyMessage}</p>
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
      style: { fontSize: "20px", fontWeight: "600", color: "var(--text-strong)" },
    },
    subtitle: subtitle
      ? {
          text: subtitle,
          align: "left",
          style: { fontSize: "12px", color: "var(--text-subtle)" },
        }
      : undefined,
    xAxis: {
      type: "datetime",
      tickPixelInterval: 120,
      labels: { style: { color: "var(--text-subtle)" } },
    },
    yAxis: yAxisTitles.map((title, index) => ({
      title: { text: title, style: { color: "var(--text-strong)" } },
      labels: { style: { color: "var(--text-subtle)" } },
      opposite: index > 0,
      offset: index === 2 ? 60 : undefined,
    })),
    legend: {
      align: "left",
      verticalAlign: "top",
      itemStyle: { color: "var(--text-strong)", fontWeight: "600" },
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
    <section className="mt-6">
      <div className="hm-panel p-6">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </section>
  );
}
