import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import CollapsiblePanel from "@/components/layout/CollapsiblePanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import { getVehicleInsuranceUseCase, getVehicleUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

type VehicleInsurancePageProps = {
  params: Promise<{ vehicleId: string }>;
};

type InsuranceDetails = {
  insurer?: {
    name?: string;
    taxId?: string;
    address?: string;
  };
  policyHolder?: {
    name?: string;
    dni?: string;
    birthDate?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    region?: string;
    phone?: string;
    email?: string;
    drivingLicense?: {
      type?: string;
      validFrom?: string;
    };
  };
  vehicle?: {
    model?: string;
    type?: string;
    plate?: string;
    age?: string;
    usage?: string;
    circulationArea?: string;
    usualZone?: string;
  };
  coverages?: {
    mandatoryLiability?: string;
    supplementaryLiability?: string;
    driverInsurance?: {
      death?: string;
      permanentDisability?: string;
      medicalAssistance?: string;
    };
    legalDefense?: string;
    roadsideAssistance?: string;
    fire?: string;
    theft?: string;
    windows?: string;
    ownDamage?: {
      included?: boolean;
      deductible?: string;
    };
    weatherEvents?: string;
    wildlifeCollision?: string;
  };
  totalLossCompensation?: {
    first2Years?: string;
    thirdYear?: string;
    fromFourthYear?: string;
  };
  premium?: {
    netPremium?: string;
    discounts?: string;
    taxes?: string;
    consortium?: string;
    totalPremium?: string;
    paymentFrequency?: string;
    paymentMethod?: string;
  };
  electronicSignature?: {
    platform?: string;
    status?: string;
    signedAt?: string;
    method?: string;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const formatDateString = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return formatDate(parsed);
};

export default async function VehicleInsurancePage({ params }: VehicleInsurancePageProps) {
  const locale = await getServerLocale();
  const labels = getLabels(locale);
  const { vehicleId: rawVehicleId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);

  if (Number.isNaN(vehicleId)) {
    notFound();
  }

  const [vehicle, insurance] = await Promise.all([
    getVehicleUseCase(vehicleId),
    getVehicleInsuranceUseCase(vehicleId),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleTitle = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;
  const details = isRecord(insurance?.details)
    ? (insurance.details as InsuranceDetails)
    : undefined;
  const ownDamageIncluded = details?.coverages?.ownDamage?.included;
  const ownDamageStatus =
    ownDamageIncluded === true
      ? labels.vehicleInsurance.coverageIncluded
      : ownDamageIncluded === false
        ? labels.vehicleInsurance.coverageExcluded
        : labels.common.emptyValue;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.vehicleInsurance.eyebrow}
        title={labels.vehicleInsurance.title}
        description={vehicleTitle}
        actionLabel={labels.vehicleInsurance.actionBack}
        actionHref={`/vehicles/${vehicle.id}`}
      />

      {!insurance ? (
        <section className="mt-12">
          <CollapsiblePanel title={labels.vehicleInsurance.title}>
            <p className="mt-3 text-sm text-[color:var(--text-muted)]">
              {labels.vehicleInsurance.emptyState}
            </p>
          </CollapsiblePanel>
        </section>
      ) : (
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <ContractPanel
            title={labels.vehicleInsurance.sections.policy}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.policyNumber,
                value: insurance.policyNumber,
              },
              {
                label: labels.vehicleInsurance.labels.policySupplement,
                value: insurance.policySupplement ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.policyType,
                value: insurance.policyType ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.issueDate,
                value: insurance.issueDate
                  ? formatDate(insurance.issueDate)
                  : labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.effectiveDate,
                value: formatDate(insurance.effectiveDate),
              },
              {
                label: labels.vehicleInsurance.labels.expiryDate,
                value: formatDate(insurance.expiryDate),
              },
              {
                label: labels.vehicleInsurance.labels.duration,
                value: insurance.duration ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.revaluation,
                value: insurance.revaluation ?? labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.insurer}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.insurerName,
                value: details?.insurer?.name ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.insurerTaxId,
                value: details?.insurer?.taxId ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.insurerAddress,
                value: details?.insurer?.address ?? labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.policyHolder}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.holderName,
                value: details?.policyHolder?.name ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderDni,
                value: details?.policyHolder?.dni ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderBirthDate,
                value:
                  formatDateString(details?.policyHolder?.birthDate) ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderAddress,
                value: details?.policyHolder?.address ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderPostalCode,
                value: details?.policyHolder?.postalCode ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderCity,
                value: details?.policyHolder?.city ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderRegion,
                value: details?.policyHolder?.region ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderPhone,
                value: details?.policyHolder?.phone ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderEmail,
                value: details?.policyHolder?.email ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderLicenseType,
                value: details?.policyHolder?.drivingLicense?.type ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.holderLicenseValidFrom,
                value:
                  formatDateString(details?.policyHolder?.drivingLicense?.validFrom) ??
                  labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.vehicle}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.vehicleModel,
                value: details?.vehicle?.model ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.vehicleType,
                value: details?.vehicle?.type ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.vehiclePlate,
                value: details?.vehicle?.plate ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.vehicleAge,
                value: details?.vehicle?.age ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.vehicleUsage,
                value: details?.vehicle?.usage ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.vehicleCirculationArea,
                value: details?.vehicle?.circulationArea ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.vehicleUsualZone,
                value: details?.vehicle?.usualZone ?? labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.coverages}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.coverageMandatoryLiability,
                value: details?.coverages?.mandatoryLiability ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageSupplementaryLiability,
                value: details?.coverages?.supplementaryLiability ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageDriverDeath,
                value: details?.coverages?.driverInsurance?.death ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageDriverDisability,
                value:
                  details?.coverages?.driverInsurance?.permanentDisability ??
                  labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageDriverMedical,
                value:
                  details?.coverages?.driverInsurance?.medicalAssistance ??
                  labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageLegalDefense,
                value: details?.coverages?.legalDefense ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageRoadside,
                value: details?.coverages?.roadsideAssistance ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageFire,
                value: details?.coverages?.fire ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageTheft,
                value: details?.coverages?.theft ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageWindows,
                value: details?.coverages?.windows ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageOwnDamage,
                value: ownDamageStatus,
              },
              {
                label: labels.vehicleInsurance.labels.coverageOwnDamageDeductible,
                value: details?.coverages?.ownDamage?.deductible ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageWeather,
                value: details?.coverages?.weatherEvents ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.coverageWildlife,
                value: details?.coverages?.wildlifeCollision ?? labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.compensation}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.compensationFirstTwoYears,
                value: details?.totalLossCompensation?.first2Years ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.compensationThirdYear,
                value: details?.totalLossCompensation?.thirdYear ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.compensationFromFourthYear,
                value: details?.totalLossCompensation?.fromFourthYear ?? labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.premium}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.premiumNet,
                value: details?.premium?.netPremium ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.premiumDiscounts,
                value: details?.premium?.discounts ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.premiumTaxes,
                value: details?.premium?.taxes ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.premiumConsortium,
                value: details?.premium?.consortium ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.premiumTotal,
                value:
                  insurance.premiumTotal != null
                    ? formatCurrency(insurance.premiumTotal)
                    : (details?.premium?.totalPremium ?? labels.common.emptyValue),
              },
              {
                label: labels.vehicleInsurance.labels.premiumPaymentFrequency,
                value:
                  insurance.paymentFrequency ??
                  details?.premium?.paymentFrequency ??
                  labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.premiumPaymentMethod,
                value:
                  insurance.paymentMethod ??
                  details?.premium?.paymentMethod ??
                  labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.signature}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.signaturePlatform,
                value: details?.electronicSignature?.platform ?? labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.signatureStatus,
                value:
                  insurance.signatureStatus ??
                  details?.electronicSignature?.status ??
                  labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.signatureSignedAt,
                value:
                  formatDateString(details?.electronicSignature?.signedAt) ??
                  labels.common.emptyValue,
              },
              {
                label: labels.vehicleInsurance.labels.signatureMethod,
                value: details?.electronicSignature?.method ?? labels.common.emptyValue,
              },
            ]}
          />

          <ContractPanel
            title={labels.vehicleInsurance.sections.documents}
            collapsible
            rows={[
              {
                label: labels.vehicleInsurance.labels.documentLink,
                value: insurance.documentUrl ? (
                  <a
                    className="text-sm font-semibold text-[color:var(--text-strong)] underline-offset-4 hover:underline"
                    href={insurance.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={insurance.documentUrl}
                  >
                    {labels.vehicleInsurance.documentLinkLabel}
                  </a>
                ) : (
                  labels.common.emptyValue
                ),
              },
            ]}
          />
        </section>
      )}
    </PageShell>
  );
}
