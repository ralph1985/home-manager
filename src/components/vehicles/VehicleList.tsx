import EntityCard from "@/components/EntityCard";
import { labels } from "@/infrastructure/ui/labels/es";

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
          {labels.vehiclesList.countLabel(vehicles.length)}
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
            const icon =
              iconSource?.trim().slice(0, 1).toUpperCase() || labels.vehicles.defaultIcon;

            return (
              <EntityCard
                key={vehicle.id}
                badge={labels.vehicles.cardBadge}
                title={headline}
                description={meta || labels.common.noExtraDetails}
                icon={icon}
                stat={{
                  label: labels.vehicles.statLabel,
                  value: vehicle.maintenanceCount.toString(),
                }}
                actions={[{ label: labels.common.viewDetail, href: `/vehicles/${vehicle.id}` }]}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}
