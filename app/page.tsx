import HomeCard from "@/components/HomeCard";
import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { listHomes } from "@/infrastructure/homeRepository";

export default async function Home() {
  const homes = await listHomes();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Panel de control"
        title="Selecciona tu vivienda para gestionar tu hogar"
        description="Visualiza facturas, consumo y tareas en un solo lugar. Cada vivienda tiene su propio espacio de control."
        actionNode={<InfoPanel label="viviendas activas" value={homes.length.toString()} />}
      />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Selector de casas</h2>
        </div>

        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </ul>
      </section>

      <section className="hm-panel mt-12 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Siguiente paso
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Conecta facturas de luz y revisa los costes por vivienda
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Define proveedores y categorias de coste para tener un desglose detallado por mes.
            </p>
          </div>
          <span className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-400">
            Proximamente
          </span>
        </div>
      </section>
    </PageShell>
  );
}
