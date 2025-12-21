import type { Home } from "@prisma/client";

import Link from "next/link";

const homeSummary = "Acceso directo a facturas, consumo y mantenimientos.";

type HomeCardProps = {
  home: Home;
};

export default function HomeCard({ home }: HomeCardProps) {
  return (
    <li className="hm-panel group flex flex-col justify-between p-6 transition hover:-translate-y-1">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
            {home.name.slice(0, 1).toUpperCase()}
          </div>
          <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-500">
            Vivienda
          </span>
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-slate-900">{home.name}</h3>
        <p className="mt-2 text-sm text-slate-600">{homeSummary}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          href={`/homes/${home.id}`}
        >
          Abrir panel
        </Link>
        <Link
          className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50"
          href={`/homes/${home.id}/energy`}
        >
          Ver facturas
        </Link>
      </div>
    </li>
  );
}
