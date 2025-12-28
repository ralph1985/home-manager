"use client";

import type { Reminder } from "@/domain/Reminder";
import type { ReminderListStatus } from "@/interfaces/reminderRepository";
import type { Labels, Locale } from "@/infrastructure/ui/labels";
import Pill from "@/components/Pill";

type HomeRemindersSectionProps = {
  reminders: Reminder[];
  status: ReminderListStatus;
  labels: Labels;
  locale: Locale;
};

type HomeReminderBucketKey = "overdueWeek" | "today" | "upcomingWeek";

type HomeReminderBucket = {
  key: HomeReminderBucketKey;
  title: string;
  description: string;
  reminders: Reminder[];
};

function formatReminderDate(locale: Locale, value: Date | null, emptyLabel: string) {
  if (!value) return emptyLabel;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function buildBuckets(reminders: Reminder[], labels: Labels) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const weekAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAhead = new Date(endOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const buckets: Record<HomeReminderBucketKey, Reminder[]> = {
    overdueWeek: [],
    today: [],
    upcomingWeek: [],
  };

  reminders.forEach((reminder) => {
    if (!reminder.dueDate) return;
    if (reminder.dueDate >= startOfToday && reminder.dueDate <= endOfToday) {
      buckets.today.push(reminder);
      return;
    }
    if (reminder.dueDate > endOfToday && reminder.dueDate <= weekAhead) {
      buckets.upcomingWeek.push(reminder);
      return;
    }
    if (reminder.dueDate < startOfToday && reminder.dueDate >= weekAgo) {
      buckets.overdueWeek.push(reminder);
    }
  });

  return [
    {
      key: "overdueWeek",
      title: labels.dashboard.homeRemindersBuckets.overdueWeek.title,
      description: labels.dashboard.homeRemindersBuckets.overdueWeek.description,
      reminders: buckets.overdueWeek,
    },
    {
      key: "today",
      title: labels.dashboard.homeRemindersBuckets.today.title,
      description: labels.dashboard.homeRemindersBuckets.today.description,
      reminders: buckets.today,
    },
    {
      key: "upcomingWeek",
      title: labels.dashboard.homeRemindersBuckets.upcomingWeek.title,
      description: labels.dashboard.homeRemindersBuckets.upcomingWeek.description,
      reminders: buckets.upcomingWeek,
    },
  ] satisfies HomeReminderBucket[];
}

export default function HomeRemindersSection({
  reminders,
  status,
  labels,
  locale,
}: HomeRemindersSectionProps) {
  const buckets = buildBuckets(reminders, labels);
  const visibleCount = buckets.reduce((total, bucket) => total + bucket.reminders.length, 0);

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-faint)]">
            {labels.dashboard.homeRemindersEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
            {labels.dashboard.homeRemindersTitle}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            {labels.dashboard.homeRemindersDescription}
          </p>
        </div>
        <Pill variant="outlineMuted" size="sm">
          {visibleCount}
        </Pill>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {status === "missing-token" ? (
          <div className="hm-panel p-6 text-sm text-[color:var(--text-muted)] lg:col-span-3">
            {labels.dashboard.homeRemindersMissingToken}
          </div>
        ) : status === "missing-project" ? (
          <div className="hm-panel p-6 text-sm text-[color:var(--text-muted)] lg:col-span-3">
            {labels.dashboard.homeRemindersMissingProject}
          </div>
        ) : status === "error" ? (
          <div className="hm-panel p-6 text-sm text-[color:var(--text-muted)] lg:col-span-3">
            {labels.dashboard.homeRemindersError}
          </div>
        ) : visibleCount === 0 ? (
          <div className="hm-panel p-6 text-sm text-[color:var(--text-muted)] lg:col-span-3">
            {labels.dashboard.homeRemindersEmpty}
          </div>
        ) : (
          buckets.map((bucket) => (
            <div key={bucket.key} className="hm-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--text-faint)]">
                {bucket.title}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[color:var(--text-strong)]">
                {bucket.description}
              </h3>
              {bucket.reminders.length === 0 ? (
                <p className="mt-4 text-sm text-[color:var(--text-subtle)]">
                  {labels.dashboard.homeRemindersBucketEmpty}
                </p>
              ) : (
                <ul className="mt-4 space-y-3 text-sm text-[color:var(--text-muted)]">
                  {bucket.reminders.map((reminder) => (
                    <li key={reminder.id} className="flex flex-col gap-1">
                      <span className="font-semibold text-[color:var(--text-strong)]">
                        {reminder.title}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-faint)]">
                        {reminder.projectName}
                      </span>
                      <span className="text-xs text-[color:var(--text-subtle)]">
                        {formatReminderDate(
                          locale,
                          reminder.dueDate,
                          labels.vehicleDetail.remindersNoDueDate
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
