import type { NumericValue } from "@/components/billing/billingFormatters";
import MaintenanceTable from "@/components/vehicles/MaintenanceTable";
import { formatCountLabel } from "@/infrastructure/ui/labels";
import { getServerLabels } from "@/infrastructure/ui/labels/server";

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

export default async function VehicleMaintenanceList({
  title,
  emptyMessage,
  maintenances,
  detailHref,
}: VehicleMaintenanceListProps) {
  const labels = await getServerLabels();

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">{title}</h2>
        <span className="text-sm text-[color:var(--text-subtle)]">
          {formatCountLabel(maintenances.length, labels.maintenanceList.countLabel)}
        </span>
      </div>

      <MaintenanceTable
        emptyMessage={emptyMessage}
        labels={labels}
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
