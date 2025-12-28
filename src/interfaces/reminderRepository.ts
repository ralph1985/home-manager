import type { Reminder } from "@/domain/Reminder";

export type ReminderListStatus = "ready" | "missing-token" | "missing-project" | "error";

export type ReminderListResult = {
  reminders: Reminder[];
  status: ReminderListStatus;
};

export interface ReminderRepository {
  listProjectReminders(projectId: string): Promise<ReminderListResult>;
}
