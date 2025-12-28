import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
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
          <span className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-500">
            {statusTag}
          </span>
        }
      />

      <section className="mt-8">
        <Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" href="/">
          {labels.common.backToHome}
        </Link>
      </section>

      <section className="hm-panel mt-6 p-6">
        {status === "missing-token" ? (
          <p className="text-sm text-slate-600">{labels.ticktickProjects.missingTokenMessage}</p>
        ) : status === "error" ? (
          <p className="text-sm text-slate-600">{labels.ticktickProjects.errorMessage}</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-600">{labels.ticktickProjects.emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{labels.ticktickProjects.hintMessage}</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200/70">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      {labels.ticktickProjects.tableHeaders.name}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      {labels.ticktickProjects.tableHeaders.id}
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      {labels.ticktickProjects.tableHeaders.status}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {projects.map((project) => (
                    <tr key={project.id} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-slate-900">{project.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{project.id}</td>
                      <td className="px-4 py-3 text-slate-600">
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
