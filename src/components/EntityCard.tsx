import PillLink from "@/components/PillLink";

type EntityCardAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type EntityCardStat = {
  label: string;
  value: string;
};

type EntityCardProps = {
  badge: string;
  title: string;
  description?: string;
  icon: string;
  stat?: EntityCardStat;
  actions?: EntityCardAction[];
};

const actionVariants: Record<
  NonNullable<EntityCardAction["variant"]>,
  "solidElevated" | "outline"
> = {
  primary: "solidElevated",
  secondary: "outline",
};

export default function EntityCard({
  badge,
  title,
  description,
  icon,
  stat,
  actions = [],
}: EntityCardProps) {
  return (
    <li className="hm-panel group flex flex-col justify-between p-6 transition hover:-translate-y-1">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
            {icon}
          </div>
          <div className="text-right">
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-[color:var(--text-subtle)]">
              {badge}
            </span>
            {stat ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                  {stat.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                  {stat.value}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-[color:var(--text-strong)]">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">{description}</p>
        ) : null}
      </div>
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {actions.map((action) => {
            const variant = action.variant ?? "primary";

            return (
              <PillLink
                key={`${action.href}-${action.label}`}
                variant={actionVariants[variant]}
                size="sm"
                href={action.href}
              >
                {action.label}
              </PillLink>
            );
          })}
        </div>
      ) : null}
    </li>
  );
}
