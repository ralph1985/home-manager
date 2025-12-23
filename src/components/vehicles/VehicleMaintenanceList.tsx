import type { NumericValue } from "@/components/billing/billingFormatters";
import MaintenanceTable from "@/components/vehicles/MaintenanceTable";

type VehicleMaintenanceListItem = {
  id: number;
  title: string;
  serviceDate: Date | string;
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

      <MaintenanceTable
        emptyMessage={emptyMessage}
        rows={maintenances.map((maintenance) => ({
          id: maintenance.id,
          title: maintenance.title,
          serviceDate: maintenance.serviceDate,
          odometerKm: maintenance.odometerKm,
          cost: maintenance.cost,
          workshopName: maintenance.workshopName,
          description: maintenance.description,
          href: detailHref(maintenance.id),
        }))}
      />
    </section>
  );
}
