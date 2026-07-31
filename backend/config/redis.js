const Redis = require("ioredis");

let redisClient;

try {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 1) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  redisClient.on("connect", () => {
    console.log("Redis Connected");
  });

  redisClient.on("error", (err) => {
    console.log("Redis connection failed:", err.message);
  });

  redisClient.connect().catch(() => {});
} catch (err) {
  console.log("Redis init failed:", err.message);
  redisClient = {
    get: async () => null,
    set: async () => "OK",
    del: async () => 1,
    ttl: async () => -2,
    on: () => {},
  };
}

module.exports = redisClient;
