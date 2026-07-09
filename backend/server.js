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
const dashboardRoutes = require("./routes/dashboardRoute");

const app = express();

// ---- Middleware ----
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allows cookies to be sent
  })
);

// DB connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/cloths", clothRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("StyleMate API is running");
});

// ---- Multer error handler ----
// Catches file-too-large / wrong-mimetype errors thrown by upload.js and
// returns a clean JSON response instead of Express's default HTML error page.
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

// ---- Generic catch-all error handler ----
// Without this, any error that isn't a MulterError (e.g. a malformed
// multipart request with no boundary) falls through to Express's default
// handler, which returns a bare HTML 500 with no JSON body. This was
// masking the real cause of upload failures. Always keep this as the
// LAST middleware registered.
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Unexpected server error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});