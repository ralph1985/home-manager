import { notFound } from "next/navigation";

import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import VehicleMaintenanceList from "@/components/vehicles/VehicleMaintenanceList";
import { getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import { getVehicleUseCase, listVehicleMaintenancesUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

type VehicleMaintenancesPageProps = {
  params: Promise<{ vehicleId: string }>;
};

export default async function VehicleMaintenancesPage({ params }: VehicleMaintenancesPageProps) {
  const locale = await getServerLocale();
  const labels = getLabels(locale);
  const { vehicleId: rawVehicleId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);

  if (Number.isNaN(vehicleId)) {
    notFound();
  }

  const [vehicle, maintenances] = await Promise.all([
    getVehicleUseCase(vehicleId),
    listVehicleMaintenancesUseCase(vehicleId),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleTitle = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.vehicleMaintenanceHistory.eyebrow}
        title={labels.vehicleMaintenanceHistory.title}
        description={vehicleTitle}
        actionLabel={labels.vehicleMaintenanceHistory.actionBack}
        actionHref={`/vehicles/${vehicle.id}`}
      />

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
