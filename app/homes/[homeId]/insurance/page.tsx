import { notFound } from "next/navigation";

import type { HomeInsuranceDetails, HomeInsurancePolicy } from "@/domain/HomeInsurance";
import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import Pill from "@/components/Pill";
import PillLink from "@/components/PillLink";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { listHomeInsurancePoliciesUseCase } from "@/usecases/homeInsurance";
import { getHomeUseCase } from "@/usecases/homes";

export const runtime = "nodejs";

type HomeInsurancePageProps = {
  params: Promise<{ homeId: string }>;
};

const percentFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});

export default async function HomeInsurancePage({ params }: HomeInsurancePageProps) {
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

  const policies = await listHomeInsurancePoliciesUseCase(homeId);

  const formatOptionalDate = (value?: Date | null) =>
    value ? formatDate(value) : labels.common.emptyValue;

  const formatOptionalCurrency = (value?: { toString(): string } | number | null) =>
    value == null ? labels.common.emptyValue : formatCurrency(value);

  const formatPercent = (value?: { toString(): string } | number | null) =>
    value == null
      ? labels.common.emptyValue
      : `${percentFormatter.format(Number(value.toString()))}%`;

  const formatReceiptPeriod = (policy: HomeInsurancePolicy) => {
    if (policy.receiptStart && policy.receiptEnd) {
      return `${formatDate(policy.receiptStart)} -> ${formatDate(policy.receiptEnd)}`;
    }

    if (policy.receiptStart) {
      return formatDate(policy.receiptStart);
    }

    if (policy.receiptEnd) {
      return formatDate(policy.receiptEnd);
    }

    return labels.common.emptyValue;
  };

  const formatRiskAddress = (policy: HomeInsurancePolicy) => {
    const parts = [policy.riskAddressLine, policy.riskPostalCode, policy.riskCity].filter((value) =>
      Boolean(value)
    );
    return parts.length > 0 ? parts.join(" - ") : labels.common.emptyValue;
  };

  const buildCoverageItems = (details: HomeInsuranceDetails | null) => {
    const coverages = details?.coverages ?? null;

    if (!coverages) {
      return [];
    }

    return [
      { label: labels.homeInsurance.coverages.dwelling, value: coverages.dwellingEur },
      { label: labels.homeInsurance.coverages.contents, value: coverages.contentsEur },
      { label: labels.homeInsurance.coverages.jewelry, value: coverages.jewelryEur },
      {
        label: labels.homeInsurance.coverages.aestheticDwelling,
        value: coverages.aestheticDwellingEur,
      },
      {
        label: labels.homeInsurance.coverages.aestheticContents,
        value: coverages.aestheticContentsEur,
      },
      { label: labels.homeInsurance.coverages.liability, value: coverages.liabilityEur },
      { label: labels.homeInsurance.coverages.legalDefense, value: coverages.legalDefenseEur },
    ].filter((item) => item.value != null);
  };

  const buildReceiptItems = (details: HomeInsuranceDetails | null) => {
    const receipt = details?.receipt ?? null;

    if (!receipt) {
      return [];
    }

    return [
      { label: labels.homeInsurance.receipt.basePremium, value: receipt.basePremiumEur },
      { label: labels.homeInsurance.receipt.legalDefense, value: receipt.legalDefensePremiumEur },
      { label: labels.homeInsurance.receipt.consortium, value: receipt.consortiumEur },
      { label: labels.homeInsurance.receipt.taxes, value: receipt.taxesEur },
      { label: labels.homeInsurance.receipt.total, value: receipt.totalEur },
    ].filter((item) => item.value != null);
  };

  const buildPaymentItems = (details: HomeInsuranceDetails | null) => {
    const payment = details?.payment ?? null;

    if (!payment || !payment.cardMasked) {
      return [];
    }

    return [{ label: labels.homeInsurance.payment.cardMasked, value: payment.cardMasked }];
  };

  const buildLoyaltyItems = (details: HomeInsuranceDetails | null) => {
    const loyalty = details?.loyalty ?? null;

    if (!loyalty) {
      return [];
    }

    return [
      { label: labels.homeInsurance.loyalty.treboles, value: loyalty.trebolesAccumulated },
      { label: labels.homeInsurance.loyalty.conversion, value: loyalty.conversion },
      { label: labels.homeInsurance.loyalty.minimumDiscount, value: loyalty.minimumDiscount },
    ].filter((item) => item.value != null);
  };

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.homeInsurance.eyebrow}
        title={`${labels.homeInsurance.titlePrefix} ${home.name}`}
        description={labels.homeInsurance.description}
        actionNode={
          <PillLink href={`/homes/${home.id}`} variant="outline" size="xsWide">
            {labels.common.backToPanel}
          </PillLink>
        }
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[color:var(--text-strong)]">
          {labels.homeInsurance.listTitle}
        </h2>

        {policies.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">
            {labels.homeInsurance.emptyList}
          </p>
        ) : (
          <div className="mt-6 grid gap-6">
            {policies.map((policy) => {
              const details = policy.details;
              const coverageItems = buildCoverageItems(details);
              const receiptItems = buildReceiptItems(details);
              const paymentItems = buildPaymentItems(details);
              const loyaltyItems = buildLoyaltyItems(details);

              const policyItems = [
                {
                  label: labels.homeInsurance.fields.policyNumber,
                  value: policy.policyNumber,
                },
                {
                  label: labels.homeInsurance.fields.documentStatus,
                  value: policy.documentStatus,
                },
                {
                  label: labels.homeInsurance.fields.issueDate,
                  value: formatOptionalDate(policy.issueDate),
                },
                {
                  label: labels.homeInsurance.fields.effectiveDate,
                  value: formatOptionalDate(policy.effectiveDate),
                },
                {
                  label: labels.homeInsurance.fields.expiryDate,
                  value: formatOptionalDate(policy.expiryDate),
                },
                {
                  label: labels.homeInsurance.fields.receiptPeriod,
                  value: formatReceiptPeriod(policy),
                },
                {
                  label: labels.homeInsurance.fields.revaluationPct,
                  value: formatPercent(policy.revaluationPct),
                },
                {
                  label: labels.homeInsurance.fields.premiumTotal,
                  value: formatOptionalCurrency(policy.premiumTotal),
                },
                {
                  label: labels.homeInsurance.fields.paymentMethod,
                  value: policy.paymentMethod ?? labels.common.emptyValue,
                },
                {
                  label: labels.homeInsurance.fields.paymentFrequency,
                  value: policy.paymentFrequency ?? labels.common.emptyValue,
                },
                {
                  label: labels.homeInsurance.fields.riskAddress,
                  value: formatRiskAddress(policy),
                },
                {
                  label: labels.homeInsurance.fields.documentUrl,
                  value: policy.documentUrl ? (
                    <a
                      className="text-sm text-[color:var(--accent-strong)] underline"
                      href={policy.documentUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {labels.homeInsurance.documentLinkLabel}
                    </a>
                  ) : (
                    labels.common.emptyValue
                  ),
                },
              ];

              return (
                <div key={policy.id} className="hm-panel p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                        {policy.insurer}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                        {policy.product}
                      </h3>
                    </div>
                    <Pill variant="outlineMutedFaint" size="sm">
                      {policy.documentStatus}
                    </Pill>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {policyItems.map((item) => (
                      <div key={item.label}>
                        <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                          {item.label}
                        </p>
                        <div className="mt-1 text-sm text-[color:var(--text-strong)]">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {coverageItems.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">
                        {labels.homeInsurance.coveragesTitle}
                      </h4>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {coverageItems.map((item) => (
                          <div key={item.label} className="text-sm text-[color:var(--text-muted)]">
                            <span className="font-medium text-[color:var(--text-strong)]">
                              {item.label}:
                            </span>{" "}
                            {formatOptionalCurrency(item.value ?? null)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {receiptItems.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">
                        {labels.homeInsurance.receiptTitle}
                      </h4>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {receiptItems.map((item) => (
                          <div key={item.label} className="text-sm text-[color:var(--text-muted)]">
                            <span className="font-medium text-[color:var(--text-strong)]">
                              {item.label}:
                            </span>{" "}
                            {formatOptionalCurrency(item.value ?? null)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {paymentItems.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">
                        {labels.homeInsurance.paymentTitle}
                      </h4>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {paymentItems.map((item) => (
                          <div key={item.label} className="text-sm text-[color:var(--text-muted)]">
                            <span className="font-medium text-[color:var(--text-strong)]">
                              {item.label}:
                            </span>{" "}
                            {item.value ?? labels.common.emptyValue}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {loyaltyItems.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-[color:var(--text-strong)]">
                        {labels.homeInsurance.loyaltyTitle}
                      </h4>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {loyaltyItems.map((item) => (
                          <div key={item.label} className="text-sm text-[color:var(--text-muted)]">
                            <span className="font-medium text-[color:var(--text-strong)]">
                              {item.label}:
                            </span>{" "}
                            {item.value ?? labels.common.emptyValue}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
