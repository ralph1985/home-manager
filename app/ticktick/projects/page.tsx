import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import Pill from "@/components/Pill";
import { formatCountLabel, getLabels } from "@/infrastructure/ui/labels";
import { getServerLocale } from "@/infrastructure/ui/labels/server";
import { listTickTickProjects } from "@/usecases/ticktickProjects";

export default async function TickTickProjectsPage() {
  const [locale, projectsResult] = await Promise.all([getServerLocale(), listTickTickProjects()]);
  const labels = getLabels(locale);
  const { projects, status } = projectsResult;

  const statusTag =
    status === "ready"
      ? formatCountLabel(projects.length, labels.ticktickProjects.countLabel)
      : status === "missing-token"
        ? labels.ticktickProjects.missingTokenTag
        : labels.ticktickProjects.errorTag;

  return (
    <PageShell>
      <SectionHeader
        eyebrow={labels.ticktickProjects.eyebrow}
        title={labels.ticktickProjects.title}
        description={labels.ticktickProjects.description}
        actionNode={
          <Pill variant="outlineMuted" size="sm">
            {statusTag}
          </Pill>
        }
      />

      <section className="mt-8">
        <Link
          className="text-sm font-semibold text-[color:var(--text-subtle)] hover:text-[color:var(--text-strong)]"
          href="/"
        >
          {labels.common.backToHome}
        </Link>
      </section>

      <section className="hm-panel mt-6 p-6">
        {status === "missing-token" ? (
          <p className="text-sm text-[color:var(--text-muted)]">
            {labels.ticktickProjects.missingTokenMessage}
          </p>
        ) : status === "error" ? (
          <p className="text-sm text-[color:var(--text-muted)]">
            {labels.ticktickProjects.errorMessage}
          </p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-[color:var(--text-muted)]">
            {labels.ticktickProjects.emptyMessage}
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[color:var(--text-muted)]">
              {labels.ticktickProjects.hintMessage}
            </p>
            <div className="overflow-hidden rounded-2xl border border-[var(--surface-border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[color:var(--text-muted)]">
                      {labels.ticktickProjects.tableHeaders.name}
                    </th>
                    <th className="px-4 py-3 font-semibold text-[color:var(--text-muted)]">
                      {labels.ticktickProjects.tableHeaders.id}
                    </th>
                    <th className="px-4 py-3 font-semibold text-[color:var(--text-muted)]">
                      {labels.ticktickProjects.tableHeaders.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)]">
                  {projects.map((project) => (
                    <tr key={project.id} className="bg-[var(--surface)]">
                      <td className="px-4 py-3 font-semibold text-[color:var(--text-strong)]">
                        {project.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[color:var(--text-muted)]">
                        {project.id}
                      </td>
                      <td className="px-4 py-3 text-[color:var(--text-muted)]">
                        {project.closed
                          ? labels.ticktickProjects.statusClosed
                          : labels.ticktickProjects.statusOpen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
