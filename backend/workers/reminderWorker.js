const { Worker } = require("bullmq");
const connection = require("../config/queueConnection");
const { REMINDER_QUEUE_NAME } = require("../queues/reminderQueue");
const Planner = require("../models/plannerModel");
const { createNotification } = require("../services/notificationService");
const { sendNotificationEmail } = require("../utils/sendEmail");

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

const buildContent = (kind, outfitName, dateStr) => {
  if (kind === "dayBefore") {
    return {
      type: "planner_reminder_day_before",
      title: "Outfit reminder — tomorrow",
      message: `Don't forget: you've planned "${outfitName}" for ${dateStr}.`,
    };
  }
  return {
    type: "planner_reminder_morning_of",
    title: "Today's planned outfit",
    message: `Good morning! Today (${dateStr}) you planned to wear "${outfitName}".`,
  };
};

const initReminderWorker = () => {
  const worker = new Worker(
    REMINDER_QUEUE_NAME,
    async (job) => {
      const { planId, userId, kind } = job.data;

      const plan = await Planner.findById(planId)
        .populate("outfit", "name")
        .populate("user", "name email");

      // Plan may have been deleted after the reminder was scheduled — nothing to do.
      if (!plan) return;

      const outfitName = plan.outfit?.name || "your outfit";
      const dateStr = formatDate(plan.date);
      const { type, title, message } = buildContent(kind, outfitName, dateStr);

      await createNotification({
        userId,
        type,
        title,
        message,
        relatedType: "Planner",
        relatedId: plan._id,
      });

      if (plan.user?.email) {
        try {
          await sendNotificationEmail(plan.user.email, plan.user.name, title, message);
        } catch (err) {
          console.log("Reminder email failed to send:", err.message);
        }
      }
    },
    { connection }
  );

  worker.on("failed", (job, err) => {
    console.log(`Reminder job ${job?.id} failed:`, err.message);
  });

  console.log("Reminder worker started");
  return worker;
};

module.exports = initReminderWorker;
