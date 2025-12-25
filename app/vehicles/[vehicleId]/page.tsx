import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import VehicleMaintenanceList from "@/components/vehicles/VehicleMaintenanceList";
import { labels } from "@/infrastructure/ui/labels/es";
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
        eyebrow={labels.vehicleDetail.eyebrow}
        title={vehicleTitle}
        description={vehicle.licensePlate ?? labels.vehicleDetail.noPlate}
        actionLabel={labels.common.backToList}
        actionHref="/vehicles"
        actionNode={
          <InfoPanel
            label={labels.vehicles.statLabel}
            value={vehicle._count.maintenances.toString()}
          />
        }
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContractPanel
          title={labels.vehicleDetail.sheetTitle}
          rows={[
            { label: labels.vehicleDetail.labels.brand, value: vehicle.brand },
            { label: labels.vehicleDetail.labels.model, value: vehicle.model },
            {
              label: labels.vehicleDetail.labels.year,
              value: vehicle.year ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.plate,
              value: vehicle.licensePlate ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.vin,
              value: vehicle.vin ?? labels.common.emptyValue,
            },
          ]}
        />
        <ContractPanel
          title={labels.vehicleDetail.summaryTitle}
          rows={[
            { label: labels.vehicleDetail.labels.maintenances, value: vehicle._count.maintenances },
            {
              label: labels.vehicleDetail.labels.lastService,
              value: latestMaintenance
                ? formatDate(latestMaintenance.serviceDate)
                : labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.lastOdometer,
              value:
                latestMaintenance?.odometerKm != null
                  ? `${kmFormatter.format(latestMaintenance.odometerKm)} ${labels.units.km}`
                  : labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.lastCost,
              value:
                latestMaintenance?.cost != null ? (
                  <span className="text-lg font-semibold text-slate-900">
                    {formatCurrency(latestMaintenance.cost)}
                  </span>
                ) : (
                  labels.common.emptyValue
                ),
            },
          ]}
        />
      </section>

      {vehicle.notes ? (
        <section className="mt-6">
          <div className="hm-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {labels.vehicleDetail.notesTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-600">{vehicle.notes}</p>
          </div>
        </section>
      ) : null}

      <VehicleMaintenanceList
        title={labels.vehicleDetail.maintenanceHistoryTitle}
        emptyMessage={labels.vehicleDetail.emptyMaintenances}
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
