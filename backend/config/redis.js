const Redis = require("ioredis");

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  console.log("Redis Connected");
});

redisClient.on("error", (err) => {
  console.log("Redis connection failed", err.message);
});

module.exports = redisClient;
