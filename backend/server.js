require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const multer = require("multer");

const connectDB = require("./config/db");
require("./config/redis");

const authRoutes = require("./routes/authRoutes");
const userRoute = require("./routes/userRoute");
const clothRoutes = require("./routes/clothRoutes");
const outfitRoutes = require("./routes/outfitRoutes");
const dashboardRoutes = require("./routes/dashboardRoute");
const plannerRoutes = require("./routes/plannerRoutes");
const aiSuggestionRoutes = require("./routes/aiSuggestionRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/cloths", clothRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/ai-suggestions", aiSuggestionRoutes);

app.get("/", (req, res) => {
  res.send("StyleMate API is running");
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image must be smaller than 5MB" });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message && err.message.includes("Only JPG, PNG")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Unexpected server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
