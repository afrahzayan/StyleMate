const IORedis = require("ioredis");

// BullMQ requires its own ioredis connection with maxRetriesPerRequest: null.
// IMPORTANT: do NOT set enableOfflineQueue: false here — BullMQ's Worker/Queue
// rely on commands being queued (not rejected) while the connection is
// reconnecting. Setting it to false is what causes the
// "Stream isn't writeable and enableOfflineQueue options is false" crash loop.
let connection;

try {
  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Keep retrying with capped exponential backoff instead of giving up
    // after one attempt — managed Redis providers (Upstash, Redis Cloud,
    // etc.) routinely close idle connections, and we want ioredis to just
    // reconnect quietly rather than die.
    retryStrategy(times) {
      return Math.min(times * 500, 5000);
    },
    // Reconnect on the specific error Redis sends when it's shutting the
    // connection down for maintenance/idle-timeout, instead of only relying
    // on socket close events.
    reconnectOnError(err) {
      const targetErrors = ["READONLY", "ETIMEDOUT", "ECONNRESET"];
      return targetErrors.some((e) => err.message.includes(e));
    },
    lazyConnect: true,
  });

  connection.on("connect", () => {
    console.log("BullMQ Redis connection established");
  });

  connection.on("error", (err) => {
    console.log("BullMQ Redis connection error:", err.message);
  });

  connection.on("reconnecting", (ms) => {
    console.log(`BullMQ Redis reconnecting in ${ms}ms...`);
  });

  connection.connect().catch((err) => {
    console.log("BullMQ Redis initial connect failed:", err.message);
  });
} catch (err) {
  console.log("BullMQ Redis init failed:", err.message);
  connection = null;
}

module.exports = connection;