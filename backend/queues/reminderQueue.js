const { Queue } = require("bullmq");
const connection = require("../config/queueConnection");

const REMINDER_QUEUE_NAME = "planner-reminders";

const reminderQueue = new Queue(REMINDER_QUEUE_NAME, { connection });

module.exports = { reminderQueue, REMINDER_QUEUE_NAME };
