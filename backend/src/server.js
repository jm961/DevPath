const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    status: 429,
    message: "Too many login attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
});

app.use("/api/v1-login", authLimiter);
app.use("/api/v1-signup", authLimiter);
app.use("/api", limiter);

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Domain restriction middleware (production only)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const allowedHosts = ["api.devpath.sh"];
    const host = req.get("host");

    if (!allowedHosts.includes(host)) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Please use api.devpath.sh",
      });
    }
    next();
  });
}

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "DevPath API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
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

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(err.status || 500).json({
    status: err.status || 500,
    message,
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
