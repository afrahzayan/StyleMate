const { Queue } = require("bullmq");
const connection = require("../config/queueConnection");

const REMINDER_QUEUE_NAME = "planner-reminders";

let reminderQueue;

if (connection) {
  reminderQueue = new Queue(REMINDER_QUEUE_NAME, { connection });
} else {
  console.log("Reminder queue skipped — no Redis connection.");
  reminderQueue = null;
}

module.exports = { reminderQueue, REMINDER_QUEUE_NAME };
