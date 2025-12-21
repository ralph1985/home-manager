import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/infrastructure/prisma";

export const runtime = "nodejs";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type NumericValue = number | string | { toString(): string };

const toNumber = (value: NumericValue) =>
  typeof value === "number" ? value : Number(value.toString());

type EnergyBillPageProps = {
  params: Promise<{ homeId: string; billId: string }>;
};

export default async function EnergyBillPage({ params }: EnergyBillPageProps) {
  const { homeId: rawHomeId, billId: rawBillId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);
  const billId = Number.parseInt(rawBillId, 10);

  if (Number.isNaN(homeId) || Number.isNaN(billId)) {
    notFound();
  }

  const bill = await prisma.electricityBill.findFirst({
    where: { id: billId, homeId },
    include: {
      provider: true,
      supplyPoint: true,
      costLines: {
        include: { category: true },
      },
    },
  });

  if (!bill) {
    notFound();
  }

  const periodLabel =
    bill.periodStart && bill.periodEnd
      ? `${dateFormatter.format(bill.periodStart)} - ${dateFormatter.format(bill.periodEnd)}`
      : dateFormatter.format(bill.issueDate);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-[#f1c7a6]/60 blur-3xl" />
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[#b9d7d3]/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f8e6cc]/80 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-16 pt-14">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Factura de luz
            </p>
            <h1 className="mt-4 text-4xl font-[var(--font-display)] leading-tight text-slate-950 md:text-5xl">
              {bill.invoiceNumber ?? "Factura"}
            </h1>
            <p className="mt-4 text-lg text-slate-600">{periodLabel}</p>
          </div>
          <Link
            className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50"
            href={`/homes/${homeId}/energy`}
          >
            Volver al listado
          </Link>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="hm-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">Resumen</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Proveedor</dt>
                <dd className="font-semibold text-slate-900">{bill.provider?.name ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Importe total</dt>
                <dd className="font-semibold text-slate-900">
                  {currencyFormatter.format(toNumber(bill.totalAmount))}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Consumo</dt>
                <dd className="font-semibold text-slate-900">
                  {toNumber(bill.consumptionKwh)} kWh
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Fecha de emision</dt>
                <dd className="font-semibold text-slate-900">
                  {dateFormatter.format(bill.issueDate)}
                </dd>
              </div>
              {bill.paymentDate ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Fecha de cargo</dt>
                  <dd className="font-semibold text-slate-900">
                    {dateFormatter.format(bill.paymentDate)}
                  </dd>
                </div>
              ) : null}
              {bill.pdfUrl ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">PDF</dt>
                  <dd>
                    <a
                      className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
                      href={bill.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir archivo
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="hm-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">Contrato</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Tarifa</dt>
                <dd className="font-semibold text-slate-900">{bill.tariff ?? "-"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Contrato</dt>
                <dd className="font-semibold text-slate-900">{bill.contractNumber ?? "-"}</dd>
              </div>
              {bill.supplyPoint ? (
                <>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">CUPS</dt>
                    <dd className="font-semibold text-slate-900">{bill.supplyPoint.cups}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Distribuidora</dt>
                    <dd className="font-semibold text-slate-900">
                      {bill.supplyPoint.distributor ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Peaje</dt>
                    <dd className="font-semibold text-slate-900">
                      {bill.supplyPoint.gridToll ?? "-"}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
        </section>

        <section className="mt-6">
          <div className="hm-panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">Desglose</h2>
            {bill.costLines.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No hay lineas de coste asociadas.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {bill.costLines.map((line) => (
                  <li key={line.id} className="flex items-center justify-between">
                    <span className="text-slate-600">{line.category?.name ?? "Categoria"}</span>
                    <span className="font-semibold text-slate-900">
                      {currencyFormatter.format(toNumber(line.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
