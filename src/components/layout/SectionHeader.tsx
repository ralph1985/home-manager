import type { ReactNode } from "react";

import PillLink from "@/components/PillLink";

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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--text-subtle)]">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <h1 className="text-4xl font-[var(--font-display)] leading-tight text-[color:var(--text-strong)] md:text-5xl">
            {title}
          </h1>
          {titleBadge ? titleBadge : null}
        </div>
        {description ? (
          <p className="mt-4 text-lg text-[color:var(--text-muted)]">{description}</p>
        ) : null}
      </div>
      {actionNode ? (
        actionNode
      ) : actionLabel && actionHref ? (
        <PillLink href={actionHref} variant="outline" size="xsWide">
          {actionLabel}
        </PillLink>
      ) : null}
    </header>
  );
}
