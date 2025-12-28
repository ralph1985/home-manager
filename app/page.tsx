import InfoPanel from "@/components/layout/InfoPanel";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import PillLink from "@/components/PillLink";
import TickTickProjectsLink from "@/components/ticktick/TickTickProjectsLink";
import HomeRemindersSection from "@/components/ticktick/HomeRemindersSection";
import { getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import { listProjectReminders } from "@/usecases/ticktickReminders";
import { listVehiclesUseCase } from "@/usecases/vehicles";

export default async function Home() {
  const locale = await getServerLocale();
  const labels = getLabels(locale);
  const vehicles = await listVehiclesUseCase();
  const projectIds = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.ticktickProjectId).filter(Boolean))
  );
  const remindersResults = await Promise.all(
    projectIds.map((projectId) => listProjectReminders(projectId))
  );
  const reminders = remindersResults
    .filter((result) => result.status === "ready")
    .flatMap((result) => result.reminders);
  const remindersStatus =
    projectIds.length === 0
      ? "missing-project"
      : remindersResults.some((result) => result.status === "missing-token")
        ? "missing-token"
        : remindersResults.some((result) => result.status === "error")
          ? "error"
          : "ready";

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.dashboard.eyebrow}
        title={labels.dashboard.title}
        description={labels.dashboard.description}
        actionNode={
          <InfoPanel label={labels.common.panelActiveLabel} value={labels.dashboard.panelCode} />
        }
      />

      <section className="mt-4 flex justify-end">
        <TickTickProjectsLink
          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900"
          label={labels.dashboard.ticktickProjectsLink}
        />
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {labels.dashboard.homesSectionTitle}
          </h2>
        </div>

        <div className="hm-panel mt-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {labels.dashboard.homesCardTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{labels.dashboard.homesCardDescription}</p>
          </div>
          <PillLink href="/homes" variant="solidElevated" size="sm">
            {labels.dashboard.homesLinkLabel}
          </PillLink>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {labels.dashboard.vehiclesSectionTitle}
          </h2>
        </div>

        <div className="hm-panel mt-6 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {labels.dashboard.vehiclesCardTitle}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {labels.dashboard.vehiclesCardDescription}
            </p>
          </div>
          <PillLink href="/vehicles" variant="solidElevated" size="sm">
            {labels.dashboard.vehiclesLinkLabel}
          </PillLink>
        </div>
      </section>

      <div className="mt-16">
        <HomeRemindersSection
          labels={labels}
          locale={locale}
          reminders={reminders}
          status={remindersStatus}
        />
      </div>
    </PageShell>
  );
}
