import type { ReminderListResult } from "@/interfaces/reminderRepository";
import { TickTickReminderRepository } from "@/infrastructure/ticktickRepository";

const repository = new TickTickReminderRepository();

export async function listProjectReminders(
  projectId: string | null | undefined
): Promise<ReminderListResult> {
  if (!projectId) {
    return { reminders: [], status: "missing-project" };
  }

  return repository.listProjectReminders(projectId);
}
