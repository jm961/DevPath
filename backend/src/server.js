const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "DevPath API is running" });
});

// Routes
app.use("/api", authRoutes);
app.use("/api", progressRoutes);

// Placeholder routes for features not yet implemented
app.post("/api/v1-send-verification-email", (req, res) => {
  res.json({ status: "ok", message: "Verification email sent" });
});

app.post("/api/v1-verify-account", (req, res) => {
  res.json({ status: "ok", message: "Account verified" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    status: 500,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 DevPath API Server`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🌐 CORS enabled for: ${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }\n`
  );
});
