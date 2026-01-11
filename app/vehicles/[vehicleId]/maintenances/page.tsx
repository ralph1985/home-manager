import { notFound, redirect } from "next/navigation";

import CollapsiblePanel from "@/components/layout/CollapsiblePanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import VehicleMaintenanceList from "@/components/vehicles/VehicleMaintenanceList";
import { getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import {
  completeVehicleMaintenancePlanItemUseCase,
  getVehicleMaintenancePlanUseCase,
} from "@/usecases/vehicleMaintenancePlan";
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

  const [vehicle, maintenances, maintenancePlan] = await Promise.all([
    getVehicleUseCase(vehicleId),
    listVehicleMaintenancesUseCase(vehicleId),
    getVehicleMaintenancePlanUseCase(vehicleId),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleTitle = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;
  const upcomingMaintenances = maintenancePlan?.upcoming ?? [];
  const numberFormatter = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US");
  const dateFormatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    dateStyle: "medium",
  });
  const today = new Date();
  const formatInputDate = (value: Date) => value.toISOString().slice(0, 10);
  const formatKm = (value: number) => `${numberFormatter.format(value)} ${labels.units.km}`;
  const formatKmRange = (min: number | null, max: number | null) => {
    if (min != null && max != null) {
      return `${formatKm(min)} - ${formatKm(max)}`;
    }
    if (min != null) {
      return formatKm(min);
    }
    return labels.common.emptyValue;
  };

  async function markPlanItemDone(formData: FormData) {
    "use server";

    const planItemId = Number(formData.get("planItemId"));
    const serviceDateValue = formData.get("serviceDate");
    const odometerValue = formData.get("odometerKm");
    const serviceDate =
      typeof serviceDateValue === "string" && serviceDateValue
        ? new Date(serviceDateValue)
        : new Date();
    const odometerKm =
      typeof odometerValue === "string" && odometerValue
        ? Number.parseInt(odometerValue, 10)
        : null;

    await completeVehicleMaintenancePlanItemUseCase({
      vehicleId,
      planItemId,
      serviceDate,
      odometerKm: Number.isNaN(odometerKm ?? Number.NaN) ? null : odometerKm,
    });

    redirect(`/vehicles/${vehicleId}/maintenances`);
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.vehicleMaintenanceHistory.eyebrow}
        title={labels.vehicleMaintenanceHistory.title}
        description={vehicleTitle}
        actionLabel={labels.vehicleMaintenanceHistory.actionBack}
        actionHref={`/vehicles/${vehicle.id}`}
      />

      <section className="mt-12">
        <CollapsiblePanel title={labels.vehicleMaintenanceHistory.upcomingTitle}>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            {labels.vehicleMaintenanceHistory.upcomingDescription}
          </p>

          {upcomingMaintenances.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--text-muted)]">
              {labels.vehicleMaintenanceHistory.upcomingEmpty}
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {upcomingMaintenances.map((maintenance) => (
                <li
                  key={maintenance.id}
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[color:var(--text-strong)]">
                      {maintenance.title}
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm text-[color:var(--text-muted)] md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                        {labels.vehicleMaintenanceHistory.dueDateLabel}
                      </p>
                      <p className="mt-1 text-base font-semibold text-[color:var(--text-strong)]">
                        {maintenance.dueDate
                          ? dateFormatter.format(maintenance.dueDate)
                          : labels.common.emptyValue}
                        {maintenance.dueDateEstimated ? (
                          <span className="ml-2 text-xs uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                            {labels.vehicleMaintenanceHistory.estimatedLabel}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                        {labels.vehicleMaintenanceHistory.dueKmLabel}
                      </p>
                      <p className="mt-1 text-base font-semibold text-[color:var(--text-strong)]">
                        {formatKmRange(maintenance.dueKmMin, maintenance.dueKmMax)}
                      </p>
                    </div>
                  </div>

                  {maintenance.actions.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                        {labels.vehicleMaintenanceHistory.tasksLabel}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--text-muted)]">
                        {maintenance.actions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {maintenance.notes ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                        {labels.vehicleMaintenanceHistory.notesLabel}
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                        {maintenance.notes}
                      </p>
                    </div>
                  ) : null}

                  <form className="mt-4 flex flex-wrap items-end gap-3" action={markPlanItemDone}>
                    <input type="hidden" name="planItemId" value={maintenance.id} />
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                      {labels.vehicleMaintenanceHistory.serviceDateLabel}
                      <input
                        className="mt-1 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--text-default)]"
                        type="date"
                        name="serviceDate"
                        defaultValue={formatInputDate(today)}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                      {labels.vehicleMaintenanceHistory.odometerLabel}
                      <input
                        className="mt-1 w-40 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--text-default)]"
                        type="number"
                        name="odometerKm"
                        min={0}
                        placeholder="0"
                      />
                    </label>
                    <button
                      className="rounded-full border border-[var(--surface-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)] transition hover:text-[color:var(--text-strong)]"
                      type="submit"
                    >
                      {labels.vehicleMaintenanceHistory.markDoneLabel}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CollapsiblePanel>
      </section>

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
