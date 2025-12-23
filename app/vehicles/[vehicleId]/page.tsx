import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import VehicleMaintenanceList from "@/components/vehicles/VehicleMaintenanceList";
import { getVehicleUseCase, listVehicleMaintenancesUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

type VehicleDetailPageProps = {
  params: Promise<{ vehicleId: string }>;
};

const kmFormatter = new Intl.NumberFormat("es-ES");

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { vehicleId: rawVehicleId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);

  if (Number.isNaN(vehicleId)) {
    notFound();
  }

  const vehicle = await getVehicleUseCase(vehicleId);

  if (!vehicle) {
    notFound();
  }

  const maintenances = await listVehicleMaintenancesUseCase(vehicleId);
  const latestMaintenance = maintenances[0];

  const vehicleTitle = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Vehiculo"
        title={vehicleTitle}
        description={vehicle.licensePlate ?? "Sin matricula registrada"}
        actionLabel="Volver al listado"
        actionHref="/vehicles"
        actionNode={
          <InfoPanel label="mantenimientos" value={vehicle._count.maintenances.toString()} />
        }
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContractPanel
          title="Ficha"
          rows={[
            { label: "Marca", value: vehicle.brand },
            { label: "Modelo", value: vehicle.model },
            { label: "Ano", value: vehicle.year ?? "-" },
            { label: "Matricula", value: vehicle.licensePlate ?? "-" },
            { label: "VIN", value: vehicle.vin ?? "-" },
          ]}
        />
        <ContractPanel
          title="Resumen"
          rows={[
            { label: "Mantenimientos", value: vehicle._count.maintenances },
            {
              label: "Ultimo servicio",
              value: latestMaintenance ? formatDate(latestMaintenance.serviceDate) : "-",
            },
            {
              label: "Ultimo odometro",
              value:
                latestMaintenance?.odometerKm != null
                  ? `${kmFormatter.format(latestMaintenance.odometerKm)} km`
                  : "-",
            },
            {
              label: "Ultimo coste",
              value:
                latestMaintenance?.cost != null ? (
                  <span className="text-lg font-semibold text-slate-900">
                    {formatCurrency(latestMaintenance.cost)}
                  </span>
                ) : (
                  "-"
                ),
            },
          ]}
        />
      </section>

      {vehicle.notes ? (
        <section className="mt-6">
          <div className="hm-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">Notas</h2>
            <p className="mt-3 text-sm text-slate-600">{vehicle.notes}</p>
          </div>
        </section>
      ) : null}

      <VehicleMaintenanceList
        title="Historial de mantenimientos"
        emptyMessage="Todavia no hay mantenimientos registrados."
        maintenances={maintenances.map((maintenance) => ({
          id: maintenance.id,
          title: maintenance.title,
          serviceDate: maintenance.serviceDate.toISOString(),
          odometerKm: maintenance.odometerKm,
          cost: maintenance.cost != null ? maintenance.cost.toString() : undefined,
          workshopName: maintenance.workshop?.name,
          description: maintenance.description,
        }))}
        detailHref={(maintenanceId) => `/vehicles/${vehicle.id}/maintenances/${maintenanceId}`}
      />
    </PageShell>
  );
}
