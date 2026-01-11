import type { ReactNode } from "react";

type CollapsiblePanelProps = {
  title: string;
  children: ReactNode;
  actionNode?: ReactNode;
  defaultOpen?: boolean;
};

export default function CollapsiblePanel({
  title,
  children,
  actionNode,
  defaultOpen,
}: CollapsiblePanelProps) {
  return (
    <details className="hm-panel group p-6" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
        <div className="flex items-center gap-3">
          {actionNode}
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--surface-border)] text-[color:var(--text-subtle)] transition group-open:rotate-180">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </summary>
      {children}
    </details>
  );
}
