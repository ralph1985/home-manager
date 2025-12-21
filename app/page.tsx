import Button from "@/components/Button";
import HomeCard from "@/components/HomeCard";
import { prisma } from "@/infrastructure/prisma";

export default async function Home() {
  const homes = await prisma.home.findMany({
    orderBy: { name: "asc" },
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
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
              Panel de control
            </p>
            <h1 className="mt-4 text-4xl font-[var(--font-display)] leading-tight text-slate-950 md:text-5xl">
              Selecciona tu vivienda para gestionar tu hogar
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Visualiza facturas, consumo y tareas en un solo lugar. Cada
              vivienda tiene su propio espacio de control.
            </p>
          </div>
          <div className="hm-panel hm-shadow-soft flex items-center gap-4 px-5 py-4 text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              viviendas activas
            </span>
            <span className="text-3xl font-semibold text-slate-900">
              {homes.length}
            </span>
          </div>
        </header>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Selector de casas
            </h2>
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
                Define proveedores y categorias de coste para tener un desglose
                detallado por mes.
              </p>
            </div>
            <Button size="lg" variant="primary">
              Configurar categorias
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
