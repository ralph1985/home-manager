import EntityCard from "@/components/EntityCard";
import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { listHomesUseCase } from "@/usecases/homes";

const homeSummary = "Acceso directo a facturas, consumo y mantenimientos.";

export default async function HomesPage() {
  const homes = await listHomesUseCase();

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Viviendas"
        title="Selecciona tu vivienda para gestionar tu hogar"
        description="Visualiza facturas, consumo y tareas en un solo lugar. Cada vivienda tiene su propio espacio de control."
        actionLabel="Volver al inicio"
        actionHref="/"
        actionNode={<InfoPanel label="viviendas activas" value={homes.length.toString()} />}
      />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Selector de viviendas</h2>
        </div>

        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {homes.map((home) => (
            <EntityCard
              key={home.id}
              badge="Vivienda"
              title={home.name}
              description={homeSummary}
              icon={home.name.slice(0, 1).toUpperCase()}
              actions={[
                { label: "Abrir panel", href: `/homes/${home.id}`, variant: "primary" },
                { label: "Ver facturas", href: `/homes/${home.id}/energy`, variant: "secondary" },
              ]}
            />
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
