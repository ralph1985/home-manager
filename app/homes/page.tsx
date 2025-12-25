import EntityCard from "@/components/EntityCard";
import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { labels } from "@/infrastructure/ui/labels/es";
import { listHomesUseCase } from "@/usecases/homes";

export default async function HomesPage() {
  const homes = await listHomesUseCase();

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.homes.eyebrow}
        title={labels.homes.title}
        description={labels.homes.description}
        actionLabel={labels.common.backToHome}
        actionHref="/"
        actionNode={
          <InfoPanel label={labels.common.homesActiveLabel} value={homes.length.toString()} />
        }
      />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">{labels.homes.selectorTitle}</h2>
        </div>

        <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {homes.map((home) => (
            <EntityCard
              key={home.id}
              badge={labels.homes.cardBadge}
              title={home.name}
              description={labels.homes.cardDescription}
              icon={home.name.slice(0, 1).toUpperCase()}
              actions={[
                { label: labels.common.openPanel, href: `/homes/${home.id}`, variant: "primary" },
                {
                  label: labels.common.viewBills,
                  href: `/homes/${home.id}/energy`,
                  variant: "secondary",
                },
              ]}
            />
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
