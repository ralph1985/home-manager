import Link from "next/link";

import {
  formatCurrency,
  formatDate,
  type NumericValue,
} from "@/components/billing/billingFormatters";
import { parseMaintenanceDescription } from "@/components/vehicles/maintenanceDescription";

type VehicleMaintenanceListItem = {
  id: number;
  title: string;
  serviceDate: Date;
  odometerKm?: number | null;
  cost?: NumericValue | null;
  workshopName?: string | null;
  description?: string | null;
};

type VehicleMaintenanceListProps = {
  title: string;
  emptyMessage: string;
  maintenances: VehicleMaintenanceListItem[];
  detailHref: (maintenanceId: number) => string;
};

const kmFormatter = new Intl.NumberFormat("es-ES");

export default function VehicleMaintenanceList({
  title,
  emptyMessage,
  maintenances,
  detailHref,
}: VehicleMaintenanceListProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">
          {maintenances.length} mantenimiento{maintenances.length === 1 ? "" : "s"}
        </span>
      </div>

      {maintenances.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-slate-600">{emptyMessage}</div>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {maintenances.map((maintenance) => {
            const details = parseMaintenanceDescription(maintenance.description);
            const jobLabel =
              details.jobs.length > 0
                ? `Trabajo: ${details.jobs[0]}${details.jobs.length > 1 ? ` +${details.jobs.length - 1}` : ""}`
                : null;
            const partsLabel =
              !jobLabel && details.parts.length > 0 ? `Piezas: ${details.parts.length}` : null;
            const totalsLabel =
              !jobLabel && !partsLabel && details.totals.length > 0 ? "Importes detallados" : null;
            const summaryLabel = jobLabel ?? partsLabel ?? totalsLabel;

            return (
              <li key={maintenance.id} className="hm-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {maintenance.workshopName ?? "Taller"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">
                      {maintenance.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatDate(maintenance.serviceDate)}
                    </p>
                    {summaryLabel ? (
                      <p className="mt-2 text-xs text-slate-500">{summaryLabel}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      coste
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {maintenance.cost != null ? formatCurrency(maintenance.cost) : "-"}
                    </p>
                    {maintenance.odometerKm != null ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {kmFormatter.format(maintenance.odometerKm)} km
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    href={detailHref(maintenance.id)}
                  >
                    Ver detalle
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
