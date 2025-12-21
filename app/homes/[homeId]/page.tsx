import Link from "next/link";
import { notFound } from "next/navigation";

import Button from "@/components/Button";
import { prisma } from "@/infrastructure/prisma";

export const runtime = "nodejs";

const tiles = [
  {
    title: "Luz",
    description: "Facturas y consumo electrico.",
    action: "Abrir",
  },
  {
    title: "Agua",
    description: "Recibos y seguimiento del consumo.",
    action: "Abrir",
  },
  {
    title: "Gas",
    description: "Facturacion y consumo de gas.",
    action: "Abrir",
  },
  {
    title: "Seguros",
    description: "Polizas y vencimientos.",
    action: "Abrir",
  },
];

export default async function HomeDetailPage({ params }: { params: Promise<{ homeId: string }> }) {
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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Vivienda
            </p>
            <h1 className="mt-4 text-4xl font-[var(--font-display)] leading-tight text-slate-950 md:text-5xl">
              {home.name}
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Accesos rapidos a los apartados principales de la vivienda.
            </p>
          </div>
          <div className="hm-panel hm-shadow-soft flex items-center gap-4 px-5 py-4 text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              panel activo
            </span>
            <span className="text-3xl font-semibold text-slate-900">
              {home.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Servicios principales</h2>
            <Link
              className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900/20 hover:bg-slate-50"
              href="/"
            >
              Volver al selector
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {tiles.map((tile) => (
              <div key={tile.title} className="hm-panel p-6">
                <h3 className="text-xl font-semibold text-slate-900">{tile.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{tile.description}</p>
                <div className="mt-6">
                  <Button variant="primary">{tile.action}</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
