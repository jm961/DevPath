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

// Stricter rate limit for auth endpoints (relaxed in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 100 : 5, // 100 in dev, 5 in production
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

    // Allow Railway deployment domains
    const isRailwayDomain = host && host.includes(".railway.app");

    if (!allowedHosts.includes(host) && !isRailwayDomain) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Please use api.devpath.sh",
      });
    }
    next();
  });
}

// CORS - Allow multiple origins in development
const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? [
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:4321",
        "http://localhost:5173",
      ]
    : (process.env.FRONTEND_URL || "https://devpath.sh")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

const wildcardOriginPatterns = allowedOrigins
  .filter((origin) => origin.includes("*"))
  .map(
    (pattern) =>
      new RegExp(
        "^" +
          pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
          "$"
      )
  );

const exactOrigins = allowedOrigins.filter((origin) => !origin.includes("*"));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (
        exactOrigins.includes(origin) ||
        wildcardOriginPatterns.some((regex) => regex.test(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

// Health check - Railway requires this to return 200 to consider service healthy
app.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    message: "DevPath API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  // Try to check database, but don't fail health check if DB is down
  try {
    const pool = require("./config/database");
    await pool.query("SELECT 1");
    health.database = "connected";
  } catch (error) {
    health.database = "disconnected";
    health.warning = "Database connection failed, but service is running";
  }

  // Always return 200 OK so Railway considers the service healthy
  res.status(200).json(health);
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
