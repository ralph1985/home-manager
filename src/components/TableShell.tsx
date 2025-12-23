"use client";

import type { ReactNode } from "react";

type TableShellProps = {
  emptyMessage: string;
  totalCount: number;
  filteredCount: number;
  filters: ReactNode;
  children: ReactNode;
};

export default function TableShell({
  emptyMessage,
  totalCount,
  filteredCount,
  filters,
  children,
}: TableShellProps) {
  if (totalCount === 0) {
    return <div className="hm-panel mt-6 p-6 text-slate-600">{emptyMessage}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        {filters}
        <div className="text-sm text-slate-400">
          {filteredCount} resultado{filteredCount === 1 ? "" : "s"}
        </div>
      </div>

      {filteredCount === 0 ? (
        <div className="hm-panel mt-6 p-6 text-slate-600">Sin resultados.</div>
      ) : (
        children
      )}
    </div>
  );
}
