const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const initReminderWorker = require("./workers/reminderWorker");
const { startDeliveryCron } = require("./jobs/deliveryCron");

const designRoutes = require("./routes/store/designRoutes");
const customizationOptionRoutes = require("./routes/store/customizationOptionRoutes");
const priceRoutes = require("./routes/store/priceRoutes");
const aiRecommendationRoutes = require("./routes/store/aiRecommendationRoutes");
const myDesignRoutes = require("./routes/store/myDesignRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const clothRoutes = require("./routes/clothRoutes");
const outfitRoutes = require("./routes/outfitRoutes");
const aiSuggestionRoutes = require("./routes/aiSuggestionRoutes");
const plannerRoutes = require("./routes/plannerRoutes");
const communityRoutes = require("./routes/communityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoute");
const notificationRoutes = require("./routes/notificationRoute");
const orderRoutes = require("./routes/store/orderRoutes");

const app = express();
const httpServer = http.createServer(app);

connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clothes", clothRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/ai-suggestions", aiSuggestionRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/store", designRoutes);
app.use("/api/customization", customizationOptionRoutes);
app.use("/api/customization", priceRoutes);
app.use("/api/customization", aiRecommendationRoutes);
app.use("/api/customization/my-designs", myDesignRoutes);
// Socket.io must be attached to the http server (not the express app)
// so it can share the same port and upgrade HTTP connections to websockets.
initSocket(httpServer);

// Starts listening for due reminder jobs on the planner-reminders queue.
initReminderWorker();

// Starts automated cron job to monitor upcoming order delivery dates.
startDeliveryCron();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});