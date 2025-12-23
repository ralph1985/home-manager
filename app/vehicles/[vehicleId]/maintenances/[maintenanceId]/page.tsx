import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { parseMaintenanceDescription } from "@/components/vehicles/maintenanceDescription";
import { getVehicleMaintenanceUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

type MaintenanceDetailPageProps = {
  params: Promise<{ vehicleId: string; maintenanceId: string }>;
};

const kmFormatter = new Intl.NumberFormat("es-ES");

export default async function MaintenanceDetailPage({ params }: MaintenanceDetailPageProps) {
  const { vehicleId: rawVehicleId, maintenanceId: rawMaintenanceId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);
  const maintenanceId = Number.parseInt(rawMaintenanceId, 10);

  if (Number.isNaN(vehicleId) || Number.isNaN(maintenanceId)) {
    notFound();
  }

  const maintenance = await getVehicleMaintenanceUseCase(vehicleId, maintenanceId);

  if (!maintenance) {
    notFound();
  }

  const details = parseMaintenanceDescription(maintenance.description);
  const vehicleTitle = maintenance.vehicle.name ?? `${maintenance.vehicle.brand} ${maintenance.vehicle.model}`;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Mantenimiento"
        title={maintenance.title}
        description={`${vehicleTitle} · ${formatDate(maintenance.serviceDate)}`}
        actionLabel="Volver al vehiculo"
        actionHref={`/vehicles/${maintenance.vehicleId}`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContractPanel
          title="Detalle"
          rows={[
            { label: "Fecha", value: formatDate(maintenance.serviceDate) },
            { label: "Taller", value: maintenance.workshop?.name ?? "-" },
            {
              label: "Odometro",
              value: maintenance.odometerKm != null
                ? `${kmFormatter.format(maintenance.odometerKm)} km`
                : "-",
            },
            {
              label: "Coste",
              value: maintenance.cost != null ? formatCurrency(maintenance.cost) : "-",
            },
          ]}
        />
        <ContractPanel
          title="Vehiculo"
          rows={[
            { label: "Marca", value: maintenance.vehicle.brand },
            { label: "Modelo", value: maintenance.vehicle.model },
            { label: "Ano", value: maintenance.vehicle.year ?? "-" },
            { label: "Matricula", value: maintenance.vehicle.licensePlate ?? "-" },
          ]}
        />
      </section>

      <section className="mt-6">
        <div className="hm-panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">Detalle de trabajos</h2>

          {details.general.length > 0 ? (
            <div className="mt-4 text-sm text-slate-600">
              {details.general.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}

          {details.jobs.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Trabajos
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {details.jobs.map((job) => (
                  <li key={job}>{job}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {details.parts.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Piezas
              </h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Concepto</th>
                      <th className="px-4 py-3 text-right font-semibold">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.parts.map((part) => (
                      <tr key={part.label} className="border-t border-slate-100">
                        <td className="px-4 py-3">{part.label}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {part.amount != null ? formatCurrency(part.amount) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {details.totals.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Importes
              </h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm text-slate-700">
                  <tbody>
                    {details.totals.map((total) => (
                      <tr key={total.label} className="border-t border-slate-100">
                        <td
                          className={`px-4 py-3 font-medium ${
                            total.label.toLowerCase().includes("total")
                              ? "text-slate-900"
                              : "text-slate-500"
                          }`}
                        >
                          {total.label}
                        </td>
                        <td
                          className={`px-4 py-3 text-right ${
                            total.label.toLowerCase().includes("total")
                              ? "text-lg font-semibold text-slate-900"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {total.amount != null ? formatCurrency(total.amount) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {details.general.length === 0 &&
          details.jobs.length === 0 &&
          details.parts.length === 0 &&
          details.totals.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Sin detalles adicionales.</p>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
