import type { Home } from "@prisma/client";

import Button from "@/components/Button";

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
        <h3 className="mt-6 text-2xl font-semibold text-slate-900">
          {home.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600">{homeSummary}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="md" variant="primary">
          Abrir panel
        </Button>
        <Button size="md" variant="secondary">
          Ver facturas
        </Button>
      </div>
    </li>
  );
}
