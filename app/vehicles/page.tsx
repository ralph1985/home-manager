import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import VehicleList from "@/components/vehicles/VehicleList";
import { listVehiclesUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

export default async function VehiclesPage() {
  const vehicles = await listVehiclesUseCase();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Vehiculos"
        title="Gestiona tu flota domestica"
        description="Consulta fichas y mantenimientos recientes de cada coche."
        actionLabel="Volver al inicio"
        actionHref="/"
        actionNode={<InfoPanel label="vehiculos activos" value={vehicles.length.toString()} />}
      />

      <VehicleList
        title="Vehiculos registrados"
        emptyMessage="Todavia no hay vehiculos registrados."
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
    </PageShell>
  );
}
