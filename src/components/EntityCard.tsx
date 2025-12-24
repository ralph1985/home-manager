import Link from "next/link";

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

const actionStyles: Record<NonNullable<EntityCardAction["variant"]>, string> = {
  primary:
    "hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800",
  secondary:
    "hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50",
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
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-500">
              {badge}
            </span>
            {stat ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{stat.value}</p>
              </div>
            ) : null}
          </div>
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {actions.map((action) => {
            const variant = action.variant ?? "primary";

            return (
              <Link
                key={`${action.href}-${action.label}`}
                className={actionStyles[variant]}
                href={action.href}
              >
                {action.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </li>
  );
}
