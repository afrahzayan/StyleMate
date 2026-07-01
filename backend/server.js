require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const connectDB = require("./config/db");
require("./config/redis"); 

const authRoutes = require("./routes/authRoutes");

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

app.get("/", (req, res) => {
  res.send("StyleMate API is running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});