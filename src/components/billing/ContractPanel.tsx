import type { ReactNode } from "react";

import Link from "next/link";

type ContractPanelProps = {
  title: string;
  rows: Array<{ label: string; value: ReactNode }>;
  actionLabel?: string;
  actionHref?: string;
  actionNode?: ReactNode;
};

export default function ContractPanel({
  title,
  rows,
  actionLabel,
  actionHref,
  actionNode,
}: ContractPanelProps) {
  return (
    <div className="hm-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {actionNode ? (
          actionNode
        ) : actionLabel && actionHref ? (
          <Link
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-700"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
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
