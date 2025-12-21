import Link from "next/link";
import { notFound } from "next/navigation";

import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { getHomeById } from "@/infrastructure/homeRepository";

export const runtime = "nodejs";

const tiles = [
  {
    title: "Luz",
    description: "Facturas y consumo electrico.",
    action: "Abrir",
    href: "/energy",
  },
  {
    title: "Agua",
    description: "Recibos y seguimiento del consumo.",
    action: "Abrir",
    href: "/water",
  },
  {
    title: "Gas",
    description: "Facturacion y consumo de gas.",
    action: "Proximamente",
  },
  {
    title: "Seguros",
    description: "Polizas y vencimientos.",
    action: "Proximamente",
  },
];

export default async function HomeDetailPage({ params }: { params: Promise<{ homeId: string }> }) {
  const { homeId: rawHomeId } = await params;
  const homeId = Number.parseInt(rawHomeId, 10);

  if (Number.isNaN(homeId)) {
    notFound();
  }

  const home = await getHomeById(homeId);

  if (!home) {
    notFound();
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Vivienda"
        title={home.name}
        description="Accesos rapidos a los apartados principales de la vivienda."
        actionLabel="Volver al selector"
        actionHref="/"
        actionNode={<InfoPanel label="panel activo" value={home.name.slice(0, 1).toUpperCase()} />}
      />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Servicios principales</h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {tiles.map((tile) => (
            <div key={tile.title} className="hm-panel p-6">
              <h3 className="text-xl font-semibold text-slate-900">{tile.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{tile.description}</p>
              <div className="mt-6">
                {tile.href ? (
                  <Link
                    className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    href={`/homes/${home.id}${tile.href}`}
                  >
                    {tile.action}
                  </Link>
                ) : (
                  <span className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-400">
                    {tile.action}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
