const IORedis = require("ioredis");


let connection;

try {
  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    
    retryStrategy(times) {
      return Math.min(times * 500, 5000);
    },
    
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