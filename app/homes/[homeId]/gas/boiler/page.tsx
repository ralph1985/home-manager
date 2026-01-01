import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getGasBoilerUseCase } from "@/usecases/gasBoiler";
import { getHomeUseCase } from "@/usecases/homes";

export const runtime = "nodejs";

type GasBoilerPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function GasBoilerPage({ params }: GasBoilerPageProps) {
  const labels = await getServerLabels();
  const { homeId: rawHomeId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);

  if (Number.isNaN(homeId)) {
    notFound();
  }

  const home = await getHomeUseCase(homeId);

  if (!home) {
    notFound();
  }

  const boiler = await getGasBoilerUseCase(homeId);

  const formatValue = (value?: string | null) => value ?? labels.common.emptyValue;
  const formatDateValue = (value?: Date | null) =>
    value ? formatDate(value) : labels.common.emptyValue;
  const formatEventDate = (value?: Date | null, periodLabel?: string | null) =>
    periodLabel ? periodLabel : value ? formatDate(value) : labels.common.emptyValue;

  const installation =
    boiler && (boiler.equipmentType || boiler.modelName)
      ? [boiler.equipmentType, boiler.modelName].filter(Boolean).join(" ")
      : null;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.gasBoiler.eyebrow}
        title={`${labels.gasBoiler.titlePrefix} ${home.name}`}
        description={labels.gasBoiler.description}
        actionLabel={labels.common.backToList}
        actionHref={`/homes/${home.id}/gas`}
      />

      {boiler ? (
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <ContractPanel
            title={labels.gasBoiler.equipmentTitle}
            rows={[
              {
                label: labels.gasBoiler.labels.installation,
                value: installation ?? labels.common.emptyValue,
              },
              {
                label: labels.gasBoiler.labels.commissioningDate,
                value: formatDateValue(boiler.commissioningDate),
              },
              {
                label: labels.gasBoiler.labels.officialServiceCompany,
                value: formatValue(boiler.officialServiceCompany),
              },
            ]}
          />
          <ContractPanel
            title={labels.gasBoiler.maintenanceTitle}
            rows={[
              {
                label: labels.gasBoiler.labels.lastAnnualReview,
                value: formatDateValue(boiler.lastAnnualReviewDate),
              },
              {
                label: labels.gasBoiler.labels.maintenancePlan,
                value: formatValue(boiler.maintenancePlan),
              },
              {
                label: labels.gasBoiler.labels.contractNumber,
                value: formatValue(boiler.maintenanceContractNumber),
              },
              {
                label: labels.gasBoiler.labels.contractStart,
                value: formatDateValue(boiler.maintenanceContractStart),
              },
              {
                label: labels.gasBoiler.labels.contractEnd,
                value: formatDateValue(boiler.maintenanceContractEnd),
              },
            ]}
          />
          <div className="hm-panel p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">
              {labels.gasBoiler.maintenanceHistoryTitle}
            </h2>
            {boiler.maintenanceEvents.length ? (
              <div className="mt-4 space-y-4">
                {boiler.maintenanceEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-[var(--surface-border)] p-4"
                  >
                    <div className="text-sm font-semibold text-[color:var(--text-strong)]">
                      {event.title}
                    </div>
                    <dl className="mt-3 space-y-2 text-xs text-[color:var(--text-default)]">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.date}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {formatEventDate(event.eventDate, event.periodLabel)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.provider}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {formatValue(event.provider)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.amount}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {event.amount ? formatCurrency(event.amount) : labels.common.emptyValue}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.paymentMethod}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {formatValue(event.paymentMethod)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.expiresOn}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {formatDateValue(event.expiresOn)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.notes}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {formatValue(event.notes)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="text-[color:var(--text-subtle)]">
                          {labels.gasBoiler.eventLabels.coverage}
                        </dt>
                        <dd className="text-right font-semibold text-[color:var(--text-strong)]">
                          {formatValue(event.coverageNotes)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[color:var(--text-subtle)]">
                {labels.gasBoiler.maintenanceHistoryEmpty}
              </p>
            )}
          </div>
        </section>
      ) : (
        <div className="hm-panel mt-10 p-6 text-sm text-[color:var(--text-subtle)]">
          {labels.gasBoiler.emptyMessage}
        </div>
      )}
    </PageShell>
  );
}
