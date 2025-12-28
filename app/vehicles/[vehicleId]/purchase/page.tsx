import { notFound } from "next/navigation";

import { formatCurrency, formatDate } from "@/components/billing/billingFormatters";
import ContractPanel from "@/components/billing/ContractPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import { getVehiclePurchaseUseCase, getVehicleUseCase } from "@/usecases/vehicles";

export const runtime = "nodejs";

type VehiclePurchasePageProps = {
  params: Promise<{ vehicleId: string }>;
};

export default async function VehiclePurchasePage({ params }: VehiclePurchasePageProps) {
  const locale = await getServerLocale();
  const labels = getLabels(locale);
  const { vehicleId: rawVehicleId } = await params;
  const vehicleId = Number.parseInt(rawVehicleId, 10);

  if (Number.isNaN(vehicleId)) {
    notFound();
  }

  const [vehicle, purchase] = await Promise.all([
    getVehicleUseCase(vehicleId),
    getVehiclePurchaseUseCase(vehicleId),
  ]);

  if (!vehicle) {
    notFound();
  }

  const vehicleTitle = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.vehiclePurchase.eyebrow}
        title={labels.vehiclePurchase.title}
        description={vehicleTitle}
        actionLabel={labels.vehiclePurchase.actionBack}
        actionHref={`/vehicles/${vehicle.id}`}
      />

      {!purchase ? (
        <section className="mt-12">
          <div className="hm-panel p-6 text-sm text-slate-600">
            {labels.vehiclePurchase.emptyState}
          </div>
        </section>
      ) : (
        <>
          <section className="mt-12 grid gap-6 md:grid-cols-2">
            <ContractPanel
              title={labels.vehiclePurchase.offerTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.issueDate,
                  value: formatDate(purchase.offerIssueDate),
                },
                {
                  label: labels.vehiclePurchase.labels.validUntil,
                  value: purchase.offerValidUntil
                    ? formatDate(purchase.offerValidUntil)
                    : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.offerNumber,
                  value: purchase.offerNumber ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.customerNumber,
                  value: purchase.customerNumber ?? labels.common.emptyValue,
                },
              ]}
            />
            <ContractPanel
              title={labels.vehiclePurchase.dealerTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.dealerName,
                  value: purchase.dealerName,
                },
                {
                  label: labels.vehiclePurchase.labels.dealerAddress,
                  value: purchase.dealerAddress ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.dealerPhone,
                  value: purchase.dealerPhone ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.dealerEmail,
                  value: purchase.dealerEmail ?? labels.common.emptyValue,
                },
              ]}
            />
            <ContractPanel
              title={labels.vehiclePurchase.advisorTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.advisorName,
                  value: purchase.advisorName ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.advisorPhone,
                  value: purchase.advisorPhone ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.advisorEmail,
                  value: purchase.advisorEmail ?? labels.common.emptyValue,
                },
              ]}
            />
            <ContractPanel
              title={labels.vehiclePurchase.customerTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.customerFirstName,
                  value: purchase.customerFirstName ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.customerLastName,
                  value: purchase.customerLastName ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.customerPhone,
                  value: purchase.customerPhone ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.customerEmail,
                  value: purchase.customerEmail ?? labels.common.emptyValue,
                },
              ]}
            />
            <ContractPanel
              title={labels.vehiclePurchase.vehicleTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.vehicleModel,
                  value: purchase.vehicleModel,
                },
                {
                  label: labels.vehiclePurchase.labels.vehicleTransmission,
                  value: purchase.vehicleTransmission ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehicleTrim,
                  value: purchase.vehicleTrim ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehicleFuel,
                  value: purchase.vehicleFuel ?? labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehiclePowerKw,
                  value:
                    purchase.vehiclePowerKw != null
                      ? purchase.vehiclePowerKw
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehiclePowerCv,
                  value:
                    purchase.vehiclePowerCv != null
                      ? purchase.vehiclePowerCv
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehicleEmissions,
                  value:
                    purchase.vehicleEmissionsCo2WltpGkm != null
                      ? purchase.vehicleEmissionsCo2WltpGkm
                      : labels.common.emptyValue,
                },
              ]}
            />
            <ContractPanel
              title={labels.vehiclePurchase.economicDetailTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.optionsTotalBase,
                  value:
                    purchase.optionsTotalBase != null
                      ? formatCurrency(purchase.optionsTotalBase)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.optionsTotalPvp,
                  value:
                    purchase.optionsTotalPvp != null
                      ? formatCurrency(purchase.optionsTotalPvp)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.servicesTotal,
                  value:
                    purchase.servicesTotal != null
                      ? formatCurrency(purchase.servicesTotal)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.accessoriesTotal,
                  value:
                    purchase.accessoriesTotal != null
                      ? formatCurrency(purchase.accessoriesTotal)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehicleBasePrice,
                  value:
                    purchase.vehicleBasePrice != null
                      ? formatCurrency(purchase.vehicleBasePrice)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehiclePvpPrice,
                  value:
                    purchase.vehiclePvpPrice != null
                      ? formatCurrency(purchase.vehiclePvpPrice)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.campaignBase,
                  value:
                    purchase.campaignBase != null
                      ? formatCurrency(purchase.campaignBase)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.campaignPvp,
                  value:
                    purchase.campaignPvp != null
                      ? formatCurrency(purchase.campaignPvp)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vatAmount,
                  value:
                    purchase.vatAmount != null
                      ? formatCurrency(purchase.vatAmount)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.registrationTaxAmount,
                  value:
                    purchase.registrationTaxAmount != null
                      ? formatCurrency(purchase.registrationTaxAmount)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.taxDeduction,
                  value:
                    purchase.taxDeduction != null
                      ? formatCurrency(purchase.taxDeduction)
                      : labels.common.emptyValue,
                },
              ]}
            />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="hm-panel p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {labels.vehiclePurchase.optionsTitle}
              </h2>
              {purchase.options.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">{labels.vehiclePurchase.optionsEmpty}</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        <th className="py-2 pr-4">
                          {labels.vehiclePurchase.labels.optionDescription}
                        </th>
                        <th className="py-2 pr-4">
                          {labels.vehiclePurchase.labels.optionBasePrice}
                        </th>
                        <th className="py-2">{labels.vehiclePurchase.labels.optionPvpPrice}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {purchase.options.map((option) => (
                        <tr key={option.id}>
                          <td className="py-3 pr-4 font-medium text-slate-900">
                            {option.description}
                          </td>
                          <td className="py-3 pr-4">{formatCurrency(option.basePrice)}</td>
                          <td className="py-3">{formatCurrency(option.pvpPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <ContractPanel
              title={labels.vehiclePurchase.summaryTitle}
              rows={[
                {
                  label: labels.vehiclePurchase.labels.vehicleSubtotalBase,
                  value:
                    purchase.vehicleSubtotalBase != null
                      ? formatCurrency(purchase.vehicleSubtotalBase)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.vehicleSubtotalPvp,
                  value:
                    purchase.vehicleSubtotalPvp != null
                      ? formatCurrency(purchase.vehicleSubtotalPvp)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.summaryServices,
                  value:
                    purchase.summaryServices != null
                      ? formatCurrency(purchase.summaryServices)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.summaryAccessories,
                  value:
                    purchase.summaryAccessories != null
                      ? formatCurrency(purchase.summaryAccessories)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.summarySupplies,
                  value:
                    purchase.summarySupplies != null
                      ? formatCurrency(purchase.summarySupplies)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.totalWithoutTradeIn,
                  value:
                    purchase.totalWithoutTradeIn != null
                      ? formatCurrency(purchase.totalWithoutTradeIn)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.tradeInValue,
                  value:
                    purchase.tradeInValue != null
                      ? formatCurrency(purchase.tradeInValue)
                      : labels.common.emptyValue,
                },
                {
                  label: labels.vehiclePurchase.labels.totalToPay,
                  value:
                    purchase.totalToPay != null
                      ? formatCurrency(purchase.totalToPay)
                      : labels.common.emptyValue,
                },
              ]}
            />
          </section>
        </>
      )}
    </PageShell>
  );
}
