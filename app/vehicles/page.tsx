import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import FuelPricesSection from "@/components/vehicles/FuelPricesSection";
import VehicleList from "@/components/vehicles/VehicleList";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { listVehiclesUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

export default async function VehiclesPage() {
  const labels = await getServerLabels();
  const vehicles = await listVehiclesUseCase();
  const defaultPostalCode = "28880";
  const defaultProductIds: string[] = [];

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.vehicles.eyebrow}
        title={labels.vehicles.title}
        description={labels.vehicles.description}
        actionLabel={labels.common.backToHome}
        actionHref="/"
        actionNode={
          <InfoPanel label={labels.common.vehiclesActiveLabel} value={vehicles.length.toString()} />
        }
      />

      <VehicleList
        title={labels.vehicles.listTitle}
        emptyMessage={labels.vehicles.emptyList}
        vehicles={vehicles.map((vehicle) => ({
          id: vehicle.id,
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          maintenanceCount: vehicle._count.maintenances,
        }))}
      />

      <FuelPricesSection
        labels={labels.fuelPrices}
        initialPostalCode={defaultPostalCode}
        initialProductIds={defaultProductIds}
        initialResponse={{ status: "ready", result: null }}
      />
    </PageShell>
  );
}
