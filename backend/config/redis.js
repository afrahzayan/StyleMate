const Redis = require("ioredis");

// Connects to your Redis Cloud instance using the URL from .env
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  console.log("Redis Connected");
});

redisClient.on("error", (err) => {
  console.log("Redis connection failed", err.message);
});

module.exports = redisClient;