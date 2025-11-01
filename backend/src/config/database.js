const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Production optimizations
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false } // Enable SSL in production (adjust based on your DB provider)
      : false,
});

// Test connection
pool.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Database connected");
  }
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

module.exports = pool;
