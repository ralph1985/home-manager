"use client";

import { useMemo, useState } from "react";

import TickTickProjectsLink from "@/components/ticktick/TickTickProjectsLink";
import type { Reminder } from "@/domain/Reminder";
import type { ReminderListStatus } from "@/interfaces/reminderRepository";
import { formatCountLabel } from "@/infrastructure/ui/labels";
import type { Labels, Locale } from "@/infrastructure/ui/labels";

type VehicleRemindersPanelProps = {
  reminders: Reminder[];
  status: ReminderListStatus;
  labels: Labels;
  locale: Locale;
};

function formatReminderDate(locale: Locale, value: Date | null, emptyLabel: string) {
  if (!value) return emptyLabel;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

type ReminderTabKey = "overdueLong" | "overdueRecent" | "today" | "upcoming" | "noDate";

function bucketReminders(reminders: Reminder[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const threshold = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

  const buckets: Record<ReminderTabKey, Reminder[]> = {
    overdueLong: [],
    overdueRecent: [],
    today: [],
    upcoming: [],
    noDate: [],
  };

  reminders.forEach((reminder) => {
    if (!reminder.dueDate) {
      buckets.noDate.push(reminder);
      return;
    }
    if (reminder.dueDate >= startOfToday && reminder.dueDate <= endOfToday) {
      buckets.today.push(reminder);
      return;
    }
    if (reminder.dueDate > endOfToday) {
      buckets.upcoming.push(reminder);
      return;
    }
    if (reminder.dueDate < threshold) {
      buckets.overdueLong.push(reminder);
      return;
    }
    buckets.overdueRecent.push(reminder);
  });

  return buckets;
}

export default function VehicleRemindersPanel({
  reminders,
  status,
  labels,
  locale,
}: VehicleRemindersPanelProps) {
  const [activeTab, setActiveTab] = useState<ReminderTabKey>("today");
  const buckets = useMemo(() => bucketReminders(reminders), [reminders]);
  const activeReminders = buckets[activeTab];

  const headerStatus =
    status === "ready"
      ? formatCountLabel(reminders.length, labels.vehicleDetail.remindersCountLabel)
      : status === "missing-project"
        ? labels.vehicleDetail.remindersMissingProjectTag
        : status === "missing-token"
          ? labels.vehicleDetail.remindersMissingTokenTag
          : labels.vehicleDetail.remindersErrorTag;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            {labels.vehicleDetail.remindersEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {labels.vehicleDetail.remindersTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{labels.vehicleDetail.remindersDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TickTickProjectsLink
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900"
            label={labels.vehicleDetail.remindersProjectsLink}
          />
          <span className="hm-pill border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-slate-500">
            {headerStatus}
          </span>
        </div>
      </div>

      <div className="hm-panel mt-6 divide-y divide-slate-200/70">
        {status === "missing-token" ? (
          <div className="p-6 text-sm text-slate-500">
            {labels.vehicleDetail.remindersMissingTokenMessage}
          </div>
        ) : status === "missing-project" ? (
          <div className="p-6 text-sm text-slate-500">
            {labels.vehicleDetail.remindersMissingProjectMessage}
          </div>
        ) : status === "error" ? (
          <div className="p-6 text-sm text-slate-500">
            {labels.vehicleDetail.remindersErrorMessage}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 px-6 py-4">
              {(
                [
                  {
                    key: "overdueRecent",
                    label: labels.vehicleDetail.remindersTabs.overdueRecent,
                    count: buckets.overdueRecent.length,
                  },
                  {
                    key: "today",
                    label: labels.vehicleDetail.remindersTabs.today,
                    count: buckets.today.length,
                  },
                  {
                    key: "upcoming",
                    label: labels.vehicleDetail.remindersTabs.upcoming,
                    count: buckets.upcoming.length,
                  },
                  {
                    key: "noDate",
                    label: labels.vehicleDetail.remindersTabs.noDate,
                    count: buckets.noDate.length,
                  },
                  {
                    key: "overdueLong",
                    label: labels.vehicleDetail.remindersTabs.overdueLong,
                    count: buckets.overdueLong.length,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  className={`hm-pill border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    activeTab === tab.key
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200/70 bg-white text-slate-500 hover:text-slate-900"
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} · {tab.count}
                </button>
              ))}
            </div>

            {reminders.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                {labels.vehicleDetail.remindersEmpty}
              </div>
            ) : activeReminders.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">
                {labels.vehicleDetail.remindersEmpty}
              </div>
            ) : (
              <ul className="flex flex-col">
                {activeReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{reminder.title}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {reminder.projectName}
                      </p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        {labels.vehicleDetail.remindersDueLabel}
                      </span>
                      <span>
                        {formatReminderDate(
                          locale,
                          reminder.dueDate,
                          labels.vehicleDetail.remindersNoDueDate
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
