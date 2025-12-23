import type { ReactNode } from "react";

import Link from "next/link";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  titleBadge?: ReactNode;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionNode?: ReactNode;
};

export default function SectionHeader({
  eyebrow,
  title,
  titleBadge,
  description,
  actionLabel,
  actionHref,
  actionNode,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <h1 className="text-4xl font-[var(--font-display)] leading-tight text-slate-950 md:text-5xl">
            {title}
          </h1>
          {titleBadge ? titleBadge : null}
        </div>
        {description ? <p className="mt-4 text-lg text-slate-600">{description}</p> : null}
      </div>
      {actionNode ? (
        actionNode
      ) : actionLabel && actionHref ? (
        <Link
          className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </header>
  );
}
