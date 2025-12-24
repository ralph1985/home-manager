import EntityCard from "@/components/EntityCard";

type VehicleListItem = {
  id: number;
  name?: string | null;
  brand: string;
  model: string;
  year?: number | null;
  licensePlate?: string | null;
  maintenanceCount: number;
};

type VehicleListProps = {
  title: string;
  emptyMessage: string;
  vehicles: VehicleListItem[];
};

export default function VehicleList({ title, emptyMessage, vehicles }: VehicleListProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">
          {vehicles.length} vehiculo{vehicles.length === 1 ? "" : "s"}
        </span>
      </div>

      {vehicles.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-slate-600">{emptyMessage}</div>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => {
            const headline = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;
            const meta = [vehicle.year, vehicle.licensePlate].filter(Boolean).join(" · ");
            const iconSource = vehicle.name ?? vehicle.brand;
            const icon = iconSource?.trim().slice(0, 1).toUpperCase() || "V";

            return (
              <EntityCard
                key={vehicle.id}
                badge="Vehiculo"
                title={headline}
                description={meta || "Sin detalles extra"}
                icon={icon}
                stat={{ label: "mantenimientos", value: vehicle.maintenanceCount.toString() }}
                actions={[{ label: "Ver detalle", href: `/vehicles/${vehicle.id}` }]}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
