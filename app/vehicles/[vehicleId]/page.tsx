import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import CollapsiblePanel from "@/components/layout/CollapsiblePanel";
import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import VehicleRemindersPanel from "@/components/vehicles/VehicleRemindersPanel";
import { formatCountLabel, getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import { listProjectReminders } from "@/usecases/ticktickReminders";
import {
  getVehicleInsuranceUseCase,
  getVehiclePurchaseUseCase,
  getVehicleUseCase,
  listVehicleMaintenancesUseCase,
} from "@/usecases/vehicles";

export const runtime = "nodejs";

type VehicleDetailPageProps = {
  params: Promise<{ vehicleId: string }>;
};

const kmFormatter = new Intl.NumberFormat("es-ES");

const getInsurerName = (details: unknown) => {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return null;
  }

  const insurer = (details as { insurer?: { name?: string } }).insurer;
  return typeof insurer?.name === "string" ? insurer.name : null;
};

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const locale = await getServerLocale();
  const labels = getLabels(locale);
  const { vehicleId: rawVehicleId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);

  if (Number.isNaN(vehicleId)) {
    notFound();
  }

  const vehicle = await getVehicleUseCase(vehicleId);

  if (!vehicle) {
    notFound();
  }

  const [maintenances, remindersResult, purchase, insurance] = await Promise.all([
    listVehicleMaintenancesUseCase(vehicleId),
    listProjectReminders(vehicle.ticktickProjectId),
    getVehiclePurchaseUseCase(vehicleId),
    getVehicleInsuranceUseCase(vehicleId),
  ]);
  const latestMaintenance = maintenances[0];

  const specs = vehicle.specs;
  const registration = vehicle.registrationDocument;
  const numberFormatter = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-US", {
    maximumFractionDigits: 2,
  });
  const formatNumber = (value: number | { toString(): string }) =>
    numberFormatter.format(Number(value.toString()));
  const formatWithUnit = (
    value: number | { toString(): string } | null | undefined,
    unit: string
  ) => (value == null ? labels.common.emptyValue : `${formatNumber(value)} ${unit}`);
  const formatBoolean = (value: boolean | null | undefined) =>
    value == null
      ? labels.common.emptyValue
      : value
        ? labels.common.yesLabel
        : labels.common.noLabel;

  const vehicleTitle = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;
  const insurerName = getInsurerName(insurance?.details);

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.vehicleDetail.eyebrow}
        title={vehicleTitle}
        description={vehicle.licensePlate ?? labels.vehicleDetail.noPlate}
        actionLabel={labels.common.backToList}
        actionHref="/vehicles"
        actionNode={
          <InfoPanel
            label={labels.vehicles.statLabel}
            value={vehicle._count.maintenances.toString()}
          />
        }
      />

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContractPanel
          title={labels.vehicleDetail.sheetTitle}
          actionLabel={purchase ? labels.vehicleDetail.purchaseActionLabel : undefined}
          actionHref={purchase ? `/vehicles/${vehicle.id}/purchase` : undefined}
          collapsible
          rows={[
            { label: labels.vehicleDetail.labels.brand, value: vehicle.brand },
            { label: labels.vehicleDetail.labels.model, value: vehicle.model },
            {
              label: labels.vehicleDetail.labels.year,
              value: vehicle.year ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.plate,
              value: vehicle.licensePlate ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.vin,
              value: vehicle.vin ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.purchaseDate,
              value: purchase ? formatDate(purchase.offerIssueDate) : labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.purchaseTotal,
              value:
                purchase?.totalToPay != null
                  ? formatCurrency(purchase.totalToPay)
                  : labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.purchaseModel,
              value: purchase?.vehicleModel ?? labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.purchaseDealer,
              value: purchase?.dealerName ?? labels.common.emptyValue,
            },
          ]}
        />
        <ContractPanel
          title={labels.vehicleDetail.summaryTitle}
          collapsible
          rows={[
            { label: labels.vehicleDetail.labels.maintenances, value: vehicle._count.maintenances },
            {
              label: labels.vehicleDetail.labels.lastService,
              value: latestMaintenance
                ? formatDate(latestMaintenance.serviceDate)
                : labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.lastOdometer,
              value:
                latestMaintenance?.odometerKm != null
                  ? `${kmFormatter.format(latestMaintenance.odometerKm)} ${labels.units.km}`
                  : labels.common.emptyValue,
            },
            {
              label: labels.vehicleDetail.labels.lastCost,
              value:
                latestMaintenance?.cost != null ? (
                  <span className="text-lg font-semibold text-[color:var(--text-strong)]">
                    {formatCurrency(latestMaintenance.cost)}
                  </span>
                ) : (
                  labels.common.emptyValue
                ),
            },
          ]}
        />
        {specs ? (
          <ContractPanel
            title={labels.vehicleDetail.specsTitle}
            collapsible
            rows={[
              {
                label: labels.vehicleDetail.specsLabels.type,
                value: specs.type ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.fuel,
                value: specs.fuelType ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.engineDisplacement,
                value: formatWithUnit(specs.engineDisplacementCc, labels.units.cc),
              },
              {
                label: labels.vehicleDetail.specsLabels.powerNet,
                value: formatWithUnit(specs.powerNetKw, labels.units.kw),
              },
              {
                label: labels.vehicleDetail.specsLabels.emissionsCo2,
                value: formatWithUnit(specs.emissionsCo2Gkm, labels.units.gkm),
              },
              {
                label: labels.vehicleDetail.specsLabels.emissionsStandard,
                value: specs.emissionsStandard ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.seats,
                value: specs.seats != null ? formatNumber(specs.seats) : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.color,
                value: specs.color ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.service,
                value: specs.service ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.maxMass,
                value: formatWithUnit(specs.maxMassKg, labels.units.kg),
              },
              {
                label: labels.vehicleDetail.specsLabels.maxLoad,
                value: formatWithUnit(specs.maxLoadKg, labels.units.kg),
              },
              {
                label: labels.vehicleDetail.specsLabels.massInService,
                value: formatWithUnit(specs.massInServiceKg, labels.units.kg),
              },
              {
                label: labels.vehicleDetail.specsLabels.powerWeightRatio,
                value:
                  specs.powerWeightRatio != null
                    ? formatNumber(specs.powerWeightRatio)
                    : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.homologationCode,
                value: specs.homologationCode ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.homologationCodeBase,
                value: specs.homologationCodeBase ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.baseBrand,
                value: specs.baseBrand ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.baseType,
                value: specs.baseType ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.variant,
                value: specs.variant ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.specsLabels.version,
                value: specs.version ?? labels.common.emptyValue,
              },
            ]}
          />
        ) : null}
        {registration ? (
          <ContractPanel
            title={labels.vehicleDetail.registrationTitle}
            collapsible
            rows={[
              {
                label: labels.vehicleDetail.registrationLabels.documentType,
                value: registration.documentType ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.documentReference,
                value: registration.documentReference ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.caseFileNumber,
                value: registration.caseFileNumber ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.issueDate,
                value: registration.issueDate
                  ? formatDate(registration.issueDate)
                  : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.documentDate,
                value: registration.documentDate
                  ? formatDate(registration.documentDate)
                  : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.validUntil,
                value: registration.validUntil
                  ? formatDate(registration.validUntil)
                  : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.verificationCode,
                value: registration.verificationCode ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.verificationLink,
                value: registration.verificationUrl ? (
                  <a
                    className="text-sm font-semibold text-[color:var(--text-accent)] underline"
                    href={registration.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {labels.common.open}
                  </a>
                ) : (
                  labels.common.emptyValue
                ),
              },
              {
                label: labels.vehicleDetail.registrationLabels.issuingAuthority,
                value: registration.issuingAuthority ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.issuingMinistry,
                value: registration.issuingMinistry ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.documentModel,
                value: registration.documentModel ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.registrationOffice,
                value: registration.registrationOffice ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.originCode,
                value: registration.originCode ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.additionalCode,
                value: registration.additionalCode ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.documentHash,
                value: registration.documentHash ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.holderName,
                value: registration.holderName ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.registrationLabels.holderIsRenting,
                value: formatBoolean(registration.holderIsRenting),
              },
              {
                label: labels.vehicleDetail.registrationLabels.validityDays,
                value: formatWithUnit(registration.validityDays, labels.units.days),
              },
              {
                label: labels.vehicleDetail.registrationLabels.requiresValidInspection,
                value: formatBoolean(registration.requiresValidInspection),
              },
              {
                label: labels.vehicleDetail.registrationLabels.invalidForAdministrativeProcedures,
                value: formatBoolean(registration.invalidForAdministrativeProcedures),
              },
            ]}
          />
        ) : null}
        {insurance ? (
          <ContractPanel
            title={labels.vehicleDetail.insuranceTitle}
            actionLabel={labels.vehicleDetail.insuranceActionLabel}
            actionHref={`/vehicles/${vehicle.id}/insurance`}
            collapsible
            rows={[
              {
                label: labels.vehicleDetail.insuranceLabels.insurer,
                value: insurerName ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.insuranceLabels.policyNumber,
                value: insurance.policyNumber ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.insuranceLabels.policyType,
                value: insurance.policyType ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.insuranceLabels.effectiveDate,
                value: formatDate(insurance.effectiveDate),
              },
              {
                label: labels.vehicleDetail.insuranceLabels.expiryDate,
                value: formatDate(insurance.expiryDate),
              },
              {
                label: labels.vehicleDetail.insuranceLabels.premiumTotal,
                value:
                  insurance.premiumTotal != null
                    ? formatCurrency(insurance.premiumTotal)
                    : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.insuranceLabels.paymentFrequency,
                value: insurance.paymentFrequency ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.insuranceLabels.deductible,
                value:
                  insurance.ownDamageDeductible != null
                    ? formatCurrency(insurance.ownDamageDeductible)
                    : labels.common.emptyValue,
              },
              {
                label: labels.vehicleDetail.insuranceLabels.signatureStatus,
                value: insurance.signatureStatus ?? labels.common.emptyValue,
              },
            ]}
          />
        ) : (
          <CollapsiblePanel title={labels.vehicleDetail.insuranceTitle}>
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">
              {labels.vehicleDetail.insuranceEmpty}
            </p>
          </CollapsiblePanel>
        )}
      </section>

      {vehicle.notes ? (
        <section className="mt-6">
          <CollapsiblePanel title={labels.vehicleDetail.notesTitle}>
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">{vehicle.notes}</p>
          </CollapsiblePanel>
        </section>
      ) : null}

      <VehicleRemindersPanel
        labels={labels}
        locale={locale}
        reminders={remindersResult.reminders}
        status={remindersResult.status}
      />

      <section className="mt-12">
        <CollapsiblePanel title={labels.vehicleDetail.maintenanceHistoryTitle}>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--text-muted)]">
            <span>{formatCountLabel(maintenances.length, labels.maintenanceList.countLabel)}</span>
            <Link
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-subtle)] transition hover:text-[color:var(--text-default)]"
              href={`/vehicles/${vehicle.id}/maintenances`}
            >
              {labels.vehicleDetail.maintenanceHistoryActionLabel}
            </Link>
          </div>
          {maintenances.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">
              {labels.vehicleDetail.emptyMaintenances}
            </p>
          ) : null}
        </CollapsiblePanel>
      </section>
    </PageShell>
  );
}
