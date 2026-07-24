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
  const ids = [buildJobId(planId, "dayBefore"), buildJobId(planId, "morningOf")];
  await Promise.all(
    ids.map(async (jobId) => {
      const job = await reminderQueue.getJob(jobId);
      if (job) await job.remove();
    })
  );
};

/**
 * (Re)schedules the "day before" and "morning of" reminders for a plan.
 * Call this after create AND after update (it clears old jobs first, so
 * it's safe to call repeatedly / on every save).
 */
const scheduleReminders = async (plan) => {
  await cancelReminders(plan._id);

  const now = Date.now();
  const jobs = [];

  for (const kind of ["dayBefore", "morningOf"]) {
    const fireAt = buildReminderDate(plan.date, kind);
    const delay = fireAt.getTime() - now;

    // Don't schedule reminders that would fire in the past
    // (e.g. planning an outfit for later today, past 7:30 AM).
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
