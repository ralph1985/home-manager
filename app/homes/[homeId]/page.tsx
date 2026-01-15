import { notFound } from "next/navigation";

import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import Pill from "@/components/Pill";
import PillLink from "@/components/PillLink";
import { getServerLabels } from "@/infrastructure/ui/labels/server";
import { getHomeUseCase } from "@/usecases/homes";

export const runtime = "nodejs";

export default async function HomeDetailPage({ params }: { params: Promise<{ homeId: string }> }) {
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

  const tiles = [
    {
      title: labels.homeDetail.tiles.energy.title,
      description: labels.homeDetail.tiles.energy.description,
      action: labels.homeDetail.tiles.energy.action,
      href: "/energy",
    },
    {
      title: labels.homeDetail.tiles.water.title,
      description: labels.homeDetail.tiles.water.description,
      action: labels.homeDetail.tiles.water.action,
      href: "/water",
    },
    {
      title: labels.homeDetail.tiles.gas.title,
      description: labels.homeDetail.tiles.gas.description,
      action: labels.homeDetail.tiles.gas.action,
      href: "/gas",
    },
    {
      title: labels.homeDetail.tiles.insurance.title,
      description: labels.homeDetail.tiles.insurance.description,
      action: labels.homeDetail.tiles.insurance.action,
      href: "/insurance",
    },
  ];

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.homeDetail.eyebrow}
        title={home.name}
        description={labels.homeDetail.description}
        actionLabel={labels.common.backToSelector}
        actionHref="/homes"
        actionNode={
          <InfoPanel
            label={labels.common.panelActiveLabel}
            value={home.name.slice(0, 1).toUpperCase()}
          />
        }
      />

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-[color:var(--text-strong)]">
            {labels.homeDetail.servicesTitle}
          </h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {tiles.map((tile) => (
            <div key={tile.title} className="hm-panel p-6">
              <h3 className="text-xl font-semibold text-[color:var(--text-strong)]">
                {tile.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">{tile.description}</p>
              <div className="mt-6">
                {tile.href ? (
                  <PillLink
                    href={`/homes/${home.id}${tile.href}`}
                    variant="solidElevated"
                    size="sm"
                  >
                    {tile.action}
                  </PillLink>
                ) : (
                  <Pill variant="outlineMutedFaint" size="sm">
                    {tile.action}
                  </Pill>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
