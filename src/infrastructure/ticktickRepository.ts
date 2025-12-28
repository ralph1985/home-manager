import type { Reminder } from "@/domain/Reminder";
import type { ReminderListResult, ReminderRepository } from "@/interfaces/reminderRepository";
import type {
  TickTickProjectListResult,
  TickTickProjectRepository,
  TickTickProjectSummary,
} from "@/interfaces/ticktickProjectRepository";

const tickTickApiBaseUrl = "https://api.ticktick.com";
const tickTickOpenStatus = 0;

type TickTickProject = {
  id: string;
  name: string;
  closed?: boolean;
};

type TickTickTask = {
  id: string;
  title: string;
  dueDate?: string | null;
  status?: number | null;
  projectId?: string | null;
};

type TickTickProjectData = {
  project: TickTickProject;
  tasks?: TickTickTask[];
};

function parseTickTickDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed;
}

function compareRemindersByDueDate(a: Reminder, b: Reminder) {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate.getTime() - b.dueDate.getTime();
}

async function fetchTickTickJson<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${tickTickApiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`TickTick request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export class TickTickReminderRepository implements ReminderRepository {
  async listProjectReminders(projectId: string): Promise<ReminderListResult> {
    const accessToken = process.env.TICKTICK_ACCESS_TOKEN;
    if (!accessToken) {
      return { reminders: [], status: "missing-token" };
    }

    try {
      const projectData = await fetchTickTickJson<TickTickProjectData>(
        `/open/v1/project/${projectId}/data`,
        accessToken
      );

      const reminders = (projectData.tasks ?? [])
        .filter(
          (task) =>
            task.status === tickTickOpenStatus || task.status === null || task.status === undefined
        )
        .map<Reminder>((task) => ({
          id: task.id,
          title: task.title,
          dueDate: parseTickTickDate(task.dueDate),
          projectId: task.projectId ?? projectId,
          projectName: projectData.project.name,
        }))
        .sort(compareRemindersByDueDate);

      return { reminders, status: "ready" };
    } catch {
      return { reminders: [], status: "error" };
    }
  }
}

export class TickTickProjectRepositoryImpl implements TickTickProjectRepository {
  async listProjects(): Promise<TickTickProjectListResult> {
    const accessToken = process.env.TICKTICK_ACCESS_TOKEN;
    if (!accessToken) {
      return { projects: [], status: "missing-token" };
    }

    try {
      const projects = await fetchTickTickJson<TickTickProject[]>("/open/v1/project", accessToken);
      const summaries = projects
        .map<TickTickProjectSummary>((project) => ({
          id: project.id,
          name: project.name,
          closed: Boolean(project.closed),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return { projects: summaries, status: "ready" };
    } catch {
      return { projects: [], status: "error" };
    }
  }
}
