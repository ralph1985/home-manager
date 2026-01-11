import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import CollapsiblePanel from "@/components/layout/CollapsiblePanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { parseMaintenanceDescription } from "@/components/vehicles/maintenanceDescription";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getVehicleMaintenanceUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

type MaintenanceDetailPageProps = {
  params: Promise<{ vehicleId: string; maintenanceId: string }>;
};

const kmFormatter = new Intl.NumberFormat("es-ES");

export default async function MaintenanceDetailPage({ params }: MaintenanceDetailPageProps) {
  const labels = await getServerLabels();
  const { vehicleId: rawVehicleId, maintenanceId: rawMaintenanceId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);
  const maintenanceId = Number.parseInt(rawMaintenanceId, 10);

  if (Number.isNaN(vehicleId) || Number.isNaN(maintenanceId)) {
    notFound();
  }

  const maintenance = await getVehicleMaintenanceUseCase(vehicleId, maintenanceId);

  if (!maintenance) {
    notFound();
  }

  const details = parseMaintenanceDescription(maintenance.description);
  const vehicleTitle =
    maintenance.vehicle.name ?? `${maintenance.vehicle.brand} ${maintenance.vehicle.model}`;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.maintenanceDetail.eyebrow}
        title={maintenance.title}
        description={`${vehicleTitle} · ${formatDate(maintenance.serviceDate)}`}
        actionLabel={labels.maintenanceDetail.actionBack}
        actionHref={`/vehicles/${maintenance.vehicleId}`}
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContractPanel
          title={labels.maintenanceDetail.detailTitle}
          collapsible
          rows={[
            {
              label: labels.maintenanceDetail.labels.date,
              value: formatDate(maintenance.serviceDate),
            },
            {
              label: labels.maintenanceDetail.labels.workshop,
              value: maintenance.workshop?.name ?? labels.common.emptyValue,
            },
            {
              label: labels.maintenanceDetail.labels.odometer,
              value:
                maintenance.odometerKm != null
                  ? `${kmFormatter.format(maintenance.odometerKm)} ${labels.units.km}`
                  : labels.common.emptyValue,
            },
            {
              label: labels.maintenanceDetail.labels.cost,
              value:
                maintenance.cost != null
                  ? formatCurrency(maintenance.cost)
                  : labels.common.emptyValue,
            },
          ]}
        />
        <ContractPanel
          title={labels.maintenanceDetail.vehicleTitle}
          collapsible
          rows={[
            { label: labels.vehicleDetail.labels.brand, value: maintenance.vehicle.brand },
            { label: labels.vehicleDetail.labels.model, value: maintenance.vehicle.model },
            {
              label: labels.vehicleDetail.labels.year,
              value: maintenance.vehicle.year ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.plate,
              value: maintenance.vehicle.licensePlate ?? labels.common.emptyValue,
            },
          ]}
        />
      </section>

      <section className="mt-6">
        <CollapsiblePanel title={labels.maintenanceDetail.workDetailTitle}>
          {details.general.length > 0 ? (
            <div className="mt-4 text-sm text-[color:var(--text-muted)]">
              {details.general.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}

          {details.jobs.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                {labels.maintenanceDetail.sections.jobs}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
                {details.jobs.map((job) => (
                  <li key={job}>{job}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {details.parts.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                {labels.maintenanceDetail.sections.parts}
              </h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--surface-border)]">
                <table className="w-full text-left text-sm text-[color:var(--text-default)]">
                  <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        {labels.maintenanceDetail.table.concept}
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        {labels.maintenanceDetail.table.amount}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.parts.map((part) => (
                      <tr key={part.label} className="border-t border-slate-100">
                        <td className="px-4 py-3">{part.label}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[color:var(--text-strong)]">
                          {part.amount != null
                            ? formatCurrency(part.amount)
                            : labels.common.emptyValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {details.totals.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                {labels.maintenanceDetail.sections.totals}
              </h3>
              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--surface-border)]">
                <table className="w-full text-left text-sm text-[color:var(--text-default)]">
                  <tbody>
                    {details.totals.map((total) => (
                      <tr key={total.label} className="border-t border-slate-100">
                        <td
                          className={`px-4 py-3 font-medium ${
                            total.label.toLowerCase().includes("total")
                              ? "text-[color:var(--text-strong)]"
                              : "text-[color:var(--text-subtle)]"
                          }`}
                        >
                          {total.label}
                        </td>
                        <td
                          className={`px-4 py-3 text-right ${
                            total.label.toLowerCase().includes("total")
                              ? "text-lg font-semibold text-[color:var(--text-strong)]"
                              : "font-semibold text-[color:var(--text-strong)]"
                          }`}
                        >
                          {total.amount != null
                            ? formatCurrency(total.amount)
                            : labels.common.emptyValue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {details.general.length === 0 &&
          details.jobs.length === 0 &&
          details.parts.length === 0 &&
          details.totals.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">
              {labels.common.noAdditionalDetails}
            </p>
          ) : null}
        </CollapsiblePanel>
      </section>
    </PageShell>
  );
}
