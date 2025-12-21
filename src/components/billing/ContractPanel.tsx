import type { ReactNode } from "react";

type ContractPanelProps = {
  title: string;
  rows: Array<{ label: string; value: ReactNode }>;
};

export default function ContractPanel({ title, rows }: ContractPanelProps) {
  return (
    <div className="hm-panel p-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <dl className="mt-4 space-y-3 text-sm text-slate-700">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-slate-500">{row.label}</dt>
            <dd className="font-semibold text-slate-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
