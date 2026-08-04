const { reminderQueue } = require("../queues/reminderQueue");

// When each reminder fires, relative to the planned date.
// Change these two lines to change reminder times app-wide.
const REMINDER_TIMES = {
  dayBefore: { hour: 20, minute: 0 }, // 8:00 PM the evening before
  morningOf: { hour: 7, minute: 30 }, // 7:30 AM the morning of
};

const buildJobId = (planId, kind) => `planner:${planId}:${kind}`;

const buildReminderDate = (eventDate, kind) => {
  const d = new Date(eventDate);
  const { hour, minute } = REMINDER_TIMES[kind];

  if (kind === "dayBefore") {
    d.setDate(d.getDate() - 1);
  }
  d.setHours(hour, minute, 0, 0);
  return d;
};

/**
 * Cancels any previously scheduled reminders for a plan.
 * Safe to call even if none exist.
 */
const cancelReminders = async (planId) => {
  if (!reminderQueue) return;
  const ids = [buildJobId(planId, "exactTime"), buildJobId(planId, "dayBefore"), buildJobId(planId, "morningOf")];
  await Promise.all(
    ids.map(async (jobId) => {
      const job = await reminderQueue.getJob(jobId);
      if (job) await job.remove();
    })
  );
};

/**
 * (Re)schedules the "exact event time", "day before", and "morning of" reminders for a plan.
 * Call this after create AND after update.
 */
const scheduleReminders = async (plan) => {
  if (!reminderQueue) return;
  await cancelReminders(plan._id);

  const now = Date.now();
  const jobs = [];

  // 1. Exact Event Time Reminder
  const eventDate = new Date(plan.date);
  const exactDelay = eventDate.getTime() - now;
  if (exactDelay > 0) {
    jobs.push(
      reminderQueue.add(
        "reminder",
        { planId: String(plan._id), userId: String(plan.user), kind: "exactTime" },
        {
          jobId: buildJobId(plan._id, "exactTime"),
          delay: exactDelay,
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
    );
  }

  // 2. Day Before & Morning Of Reminders
  for (const kind of ["dayBefore", "morningOf"]) {
    const fireAt = buildReminderDate(plan.date, kind);
    const delay = fireAt.getTime() - now;

    if (delay <= 0) continue;

    jobs.push(
      reminderQueue.add(
        "reminder",
        { planId: String(plan._id), userId: String(plan.user), kind },
        {
          jobId: buildJobId(plan._id, kind),
          delay,
          removeOnComplete: true,
          removeOnFail: true,
        }
      )
    );
  }

  await Promise.all(jobs);
};

module.exports = { scheduleReminders, cancelReminders };
