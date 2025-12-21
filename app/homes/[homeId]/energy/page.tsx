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

type EnergyPageProps = {
  params: Promise<{ homeId: string }>;
};

export default async function EnergyPage({ params }: EnergyPageProps) {
  const { homeId: rawHomeId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);

  if (Number.isNaN(homeId)) {
    notFound();
  }

  const home = await prisma.home.findUnique({
    where: { id: homeId },
  });

  if (!home) {
    notFound();
  }

  const bills = await prisma.electricityBill.findMany({
    where: { homeId },
    include: { provider: true },
    orderBy: { issueDate: "desc" },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f1ea] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-[#f1c7a6]/60 blur-3xl" />
        <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-[#b9d7d3]/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f8e6cc]/80 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-14">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Luz</p>
            <h1 className="mt-4 text-4xl font-[var(--font-display)] leading-tight text-slate-950 md:text-5xl">
              Facturas de {home.name}
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Revisa los importes y periodos de facturacion de electricidad.
            </p>
          </div>
          <Link
            className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50"
            href={`/homes/${home.id}`}
          >
            Volver al panel
          </Link>
        </header>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Listado de facturas</h2>
            <span className="text-sm text-slate-500">
              {bills.length} factura{bills.length === 1 ? "" : "s"}
            </span>
          </div>

          {bills.length === 0 ? (
            <div className="hm-panel mt-6 p-6 text-slate-600">
              Todavia no hay facturas registradas.
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {bills.map((bill) => (
                <li key={bill.id} className="hm-panel p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {bill.provider?.name ?? "Proveedor"}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">
                        {bill.invoiceNumber ?? "Factura"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {bill.periodStart && bill.periodEnd
                          ? `${dateFormatter.format(bill.periodStart)} - ${dateFormatter.format(
                              bill.periodEnd
                            )}`
                          : dateFormatter.format(bill.issueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        total
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {currencyFormatter.format(toNumber(bill.totalAmount))}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {toNumber(bill.consumptionKwh)} kWh
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      href={`/homes/${home.id}/energy/${bill.id}`}
                    >
                      Ver detalle
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
