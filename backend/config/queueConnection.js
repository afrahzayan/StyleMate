const IORedis = require("ioredis");

// BullMQ requires its own ioredis connection with maxRetriesPerRequest: null,
// which is why this is separate from config/redis.js.
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("BullMQ Redis connection established");
});

connection.on("error", (err) => {
  console.log("BullMQ Redis connection failed:", err.message);
});

module.exports = connection;
